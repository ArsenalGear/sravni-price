<?php

namespace App;

use http\Env\Request;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    public function shops()
    {
        return $this->belongsToMany('App\Shop', 'shop_product')->withPivot('price', 'url');
    }

    public function category()
    {
        return $this->belongsToMany('App\Category');
    }

    public function vendor()
    {
        return $this->belongsTo('App\Vendor');
    }

    public function productFilterTypeFilterOptions()
    {
        return $this->belongsToMany('App\ProductFilterTypeFilterOption', 'product_filter_type_filter_option', 'product_id', 'product_id');
    }

    public function reviews()
    {
        return $this->hasMany('App\Review');
    }

    public function approvedReviews()
    {
        return $this->hasMany('App\Review')->where('approved', 1);
    }

    //Добавляем динамический атрибут image, в который записывается или локально загруженный файл, или ссылка на изображение на другом ресурсе, записанная в базу
    public function getImageAttribute()
    {
        //Если в ссылке на изображение нет http, значит, файл был загружен локально
        if (isset($this->image_url) && !empty($this->image_url)) {
            $image = json_decode($this->image_url)[0];
            if (stripos($image, "http") === false) {
                $image = "/storage/" . $image;
            }
            $this->attributes['image'] = $image;
        }
        return $this->attributes['image'];
    }
    //В названии товара первая буква всегда должна быть заглавной
    public function getNameAttribute()
    {

        $firstLetter = mb_strtoupper(mb_substr($this->attributes['name'], 0, 1));
        $otherWord = mb_substr($this->attributes['name'], 1);
        $name = $firstLetter . $otherWord;
        return $name;
    }

    public static function boot()
    {

        parent::boot();

        //При создании товара сохраняем его связи с магазинами.
        static::created(function ($product) {
            $productShops = \request('product-shops');


            if (!empty($productShops) && isset($productShops)) {
                $productShops = json_decode($productShops, true);
                unset($productShops[0]);
                foreach ($productShops as $i => $productShop) {
                    if (empty($productShop)) {
                        unset($productShops[$i]);
                    }
                }

                //Находим самую низкую цену в массиве
                $minPrice =  min(array_column($productShops, 'price'));
                //Находим магазин с этой ценой и получаем его url
                foreach ($productShops as $shop) {
                    if ($shop['price'] == $minPrice) {
                        $minPriceShopUrl = $shop['url'];
                    }
                }

                //Записываем в товар
                $product->min_price = $minPrice;
                $product->min_price_shop_url = $minPriceShopUrl;
                $product->shops_count = count($productShops);
                $product->save();

                $product->shops()->attach($productShops);
            }

            $itemsArr = \request('items-arr');
            if (!empty($itemsArr) && isset($itemsArr)) {
                $itemsArr = json_decode($itemsArr, true);
            }

            if (isset($itemsArr['products'])) {

                $addArr = [];
                foreach ($itemsArr['products']['add'] as $id => $name) {
                    $addArr[] = $id;
                }

                if (!empty($addArr)) {
                    $product->category()->attach($addArr);
                }
            }

            $filterTypesArr = \request('filter-types-arr');
            $filterItems = [];
            if (isset ($filterTypesArr) && !empty($filterTypesArr)) {
                $filterTypesArr = json_decode($filterTypesArr);
                if (isset($filterTypesArr->add) && ! empty($filterTypesArr->add)) {
                    foreach ($filterTypesArr->add as $filterTypeId => $filterOptions) {
                        foreach ($filterOptions as $filterOptionId) {
                            $filterItems[] = ['product_id' => $product->id, 'filter_type_id' => intval($filterTypeId), 'filter_option_id' => intval($filterOptionId)];
                        }
                    }
                }
                $product->productFilterTypeFilterOptions()->attach($filterItems);
            }
        });
    }

    public static function getPopular()
    {
        //На первое время рандомные 8 товаров
        $popularProducts = Product::orderBy('views', 'DESC')
            ->whereNull('old_price')
            ->leftJoin('category_product', 'products.id', '=', 'category_product.product_id')
            ->where('category_product.category_id', '!=', '')
            ->whereNotNull('category_product.category_id')
            ->limit(8)
            ->get();

        foreach ($popularProducts as $popularProduct) {
            $category = Category::find($popularProduct->category_id);
            $popularProduct->category_url = "/catalog/" .  $category->getAttribute('path') . "/products/" . $popularProduct->slug;
        }

        return $popularProducts;
    }

    public static function getProductHars($productId)
    {
        return ProductFilterTypeFilterOption::select('filter_types.name as filter_type_name', 'filter_options.name as filter_option_name')
            ->leftJoin('filter_types', 'product_filter_type_filter_option.filter_type_id', '=', 'filter_types.id')
            ->leftJoin('filter_options', 'product_filter_type_filter_option.filter_option_id', '=', 'filter_options.id')
            ->where('product_id', $productId)
            ->limit(20)
            ->get();
    }

    public static function getSimilarProducts($categoryPath, $productId)
    {
        $products =  Category::where('path', $categoryPath)
            ->first()
            ->products()
            ->where('products.id', '!=', $productId)
            ->limit(20)
            ->get();

        foreach ($products as $product) {
            $product->category_url = $product->category[0]->getAttribute('path') . "/products/" . $product->slug;
        }

        return $products;
    }

    //Перед переходом на сайт внешнего магазина переходим на внутреннюю страницу, с которой происходит редирект (для SEO)
    public static function generateFakeUrl($shopSlug, $productId)
    {
        return "/buy/" . $shopSlug . "/" . $productId;
    }

    //Генерация ссылки для редиректа на страницу поискаы
    public static function generateFakeSearchUrl($shopSlug, $productId)
    {
        return "/shop-search/" . $shopSlug . "/" . $productId;
    }

    public static function cacheProductAvgRateAndReviewsCount($productId)
    {
        //Получаем средний рейтинг и количество отзывов для данного товара с целью кеширования в бд
        $reviews = Review::where(['product_id' => $productId, 'approved' => 1]);
        $reviewsCount = $reviews->count();
        $avgRate = round($reviews->avg('rate'));

        //Кешируем данные товара
        $product = Product::find($productId);
        $product->reviews_count = $reviewsCount;
        $product->avg_rate = $avgRate;
        $product->save();
    }

    public static function calculateSalePercent($price, $oldPrice)
    {
        return round(100 - ($price * 100/$oldPrice));
    }
}
