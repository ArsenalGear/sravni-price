<?php

namespace App\Http\Controllers;
use App\Category;
use App\City;
use App\Product;
use App\Review;
use App\Shop;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    public function index(Request $request, $subdomain=false, $categoryPath, $product)
    {
        if (!empty($product) && !stripos($product, '/') === FALSE   ) {
            $productName = explode('/', $product)[1];

            if (Cache::has($productName)) {
                $product = Cache::get($productName);
            } else {
                $product = Cache::remember($productName, env('REDIS_ONE_PRODUCT_CACHE_TIME'), function() use ($productName) {
                    return Product::where('slug', $productName)->first();
                });
            }
        }

        if (!isset($product)) {
            abort(404);
        }

        $productId = $product->id;

        //Все магазины, в которых есть товар
        $shopsCacheName = 'product_' . $productId . ' _shops';
        if (Cache::has($shopsCacheName)) {
            $shops = Cache::get($shopsCacheName);
        } else {
            $shops = Cache::remember($shopsCacheName, env('REDIS_ONE_PRODUCT_CACHE_TIME'), function() use ($product) {
                return $product->shops;
            });
        }

        $shopsCountCacheName = $shopsCacheName . '_count';
        if (Cache::has($shopsCountCacheName)) {
            $shopsCount = Cache::get($shopsCountCacheName);
        } else {
            $shopsCount = Cache::remember($shopsCountCacheName, env('REDIS_ONE_PRODUCT_CACHE_TIME'), function() use ($shops) {
                return  $shopsCount = $shops->count();
            });
        }

        if (Cache::has($productName)) {
            $product = Cache::get($productName);
        } else {
            $product = Cache::remember($productName, env('REDIS_ONE_PRODUCT_CACHE_TIME'), function() use ($productName) {
                return Product::where('slug', $productName)->first();
            });
        }

        //Минимальная, максимальная и средняя цена на товар
        $minPrice = $shops->min('pivot.price');
        $maxPrice = $shops->max('pivot.price');
        $avgPrice = $shops->avg('pivot.price');


        //Получение магазина, наиболее близкого к средней цене
        if ($shops->count() > 1) {
            //Получаем ближайший товар дешевле средней цены
            //$lowerAvgPriceProduct = $product->shops->where('pivot.price', '<', $avgPrice)->max('pivot.price');
            $lowerAvgPriceProduct = $shops->where('pivot.price', '<', $avgPrice)->first();
            $lowerAvgPrice = $lowerAvgPriceProduct->pivot->price;
            //Получаем ближайший товар дороже средней цены
            $biggerAvgPriceProduct = $shops->where('pivot.price', '>', $avgPrice)->first();
            $biggerAvgPrice = $biggerAvgPriceProduct->pivot->price;

            $biggerProductDifference = $biggerAvgPrice - $avgPrice;
            $lowerProductDifference = $avgPrice - $lowerAvgPrice;

            //Выбираем тот товар, у которого разница цены меньше по сравнению со средней ценой
            if ($biggerProductDifference > $lowerProductDifference) {
                $middleShop = $lowerAvgPriceProduct;
            } else {
                $middleShop = $biggerAvgPriceProduct;
            }
            //Цена товара, наиболее близкого к средней цене
            $middlePrice = $middleShop->pivot->price;
        } else {
            $middlePrice = $minPrice;
            $maxPrice = "";
            $middleShop = $product->shops->first();
        }

        $middleShopUrl = Product::generateFakeUrl($middleShop->slug, $product->id);

        //Хлебные крошки
        $category = Category::where('path', $categoryPath)->first();
        $ancestors = $category->ancestors;
        foreach ($ancestors as $ancestor) {
            $breadcrumbs[] = ['path' => $ancestor->getAttribute('path'), 'name' => $ancestor->name];
        }

        $breadcrumbs[] = ['path' => $category->getAttribute('path'), 'name' => $category->name];


        //Характеристики

        $harsCacheName = 'product_' . $productId . '_hars';
        if (Cache::has($harsCacheName)) {
            $hars = Cache::get($harsCacheName);
        } else {
            $hars = Cache::remember($harsCacheName, env('REDIS_ONE_PRODUCT_CACHE_TIME'), function() use ($product) {
                return  $hars = Product::getProductHars($product->id);
            });
        }

        //Похожие товары
        $similarPoductsCacheName = 'product_' . $productId . '_similar_products';
        if (Cache::has($similarPoductsCacheName)) {
            $similarPoducts = Cache::get($similarPoductsCacheName);
        } else {
            $similarPoducts = Cache::remember($similarPoductsCacheName, env('REDIS_ONE_PRODUCT_CACHE_TIME'), function() use ($categoryPath, $product) {
                return $similarPoducts = Product::getSimilarProducts($categoryPath, $product->id);
            });
        }

        $city = City::getCityNameFromSlug($subdomain);
        //Общие метатеги для всех карточек товаров, заполняемые в админке в настройках
        //title
        if (!empty($product->title_meta)) {
            $meta['title'] = $product->title_meta;
        } else {
            //Стандартный title для всех товаров
            if (empty($product->old_price)) {
                $meta['title'] = setting('site.meta_title_products');
                $meta['title'] = str_replace('[NAME]', $product->name, $meta['title']);
                $meta['title'] = str_replace('[PRICE]', $product->min_price, $meta['title']);
                $meta['title'] = str_replace('[CITY-FIRST-FORM]', $city->name_first_form, $meta['title']);
                $meta['title'] = str_replace('[CITY-SECOND-FORM]', $city->name_second_form, $meta['title']);
            } else {
                //для товаров со скидками
                $meta['title'] = setting('site.meta_title_products_sales');
                $meta['title'] = str_replace('[NAME]', $product->name, $meta['title']);
                $meta['title'] = str_replace('[PRICE]', $product->min_price, $meta['title']);
                $meta['title'] = str_replace('[OLDPRICE]', $product->old_price, $meta['title']);
                $meta['title'] = str_replace('[CITY-FIRST-FORM]', $city->name_first_form, $meta['title']);
                $meta['title'] = str_replace('[CITY-SECOND-FORM]', $city->name_second_form, $meta['title']);
            }
        }

        //description
        if (!empty($product->description_meta)) {
            $meta['description'] = $product->description_meta;
        } else {
            //Стандартный description для всех товаров
            if (empty($product->old_price)) {
                $meta['description'] = setting('site.meta_description_products');
                $meta['description'] = str_replace('[NAME]', $product->name, $meta['description']);
                $meta['description'] = str_replace('[PRICE]', $product->min_price, $meta['description']);
                $meta['description'] = str_replace('[CITY-FIRST-FORM]', $city->name_first_form, $meta['description']);
                $meta['description'] = str_replace('[CITY-SECOND-FORM]', $city->name_second_form, $meta['description']);
            } else {
                //для товаров со скидками
                $meta['description'] = setting('site.meta_description_products_sales');
                $meta['description'] = str_replace('[NAME]', $product->name, $meta['description']);
                $meta['description'] = str_replace('[PRICE]', $product->min_price, $meta['description']);
                $meta['description'] = str_replace('[OLDPRICE]', $product->old_price, $meta['description']);
                $meta['description'] = str_replace('[CITY-FIRST-FORM]', $city->name_first_form, $meta['description']);
                $meta['description'] = str_replace('[CITY-SECOND-FORM]', $city->name_second_form, $meta['description']);
            }
        }

        //Отзывы, прошедшие модерацию
        $reviewsCacheName = 'product_' . $productId . '_reviews';
        if (Cache::has($reviewsCacheName)) {
            $reviews = Cache::get($reviewsCacheName);
        } else {
            $reviews = Cache::remember($reviewsCacheName, env('REDIS_ONE_PRODUCT_CACHE_TIME'), function() use ($product) {
                return $product->approvedReviews()->orderBy('created_at', 'DESC')->paginate(5)->onEachSide(1);
            });
        }

        //$reviews = $product->approvedReviews()->orderBy('created_at', 'DESC')->paginate(5)->onEachSide(1);

        foreach ($reviews as $review) {
            $review->time = Carbon::parse($review->created_at)->format('d.m.Y');
        }

        if ($request->ajax()) {
            return ['items' => $reviews->items(), 'pagination' => strval($reviews->links('vendor/pagination/default')) ];
        }


        $resultShopsListCacheName = 'product_' . $productId . '_result_shops_list';
        if (Cache::has($resultShopsListCacheName)) {
            $resultShopsList = Cache::get($resultShopsListCacheName);
        } else {
            $resultShopsList = Cache::remember($resultShopsListCacheName, env('REDIS_ONE_PRODUCT_CACHE_TIME'), function() use ($middleShop, $product) {
                /*
                 * Генерация списка магазинов товара
                 * Первый магазин - всегда middleShop
                 * Далее - магазины, отмеченные в админ-панели как приоритетные, даже если такой магазин у товара отсутствует
                 * После идёт список остальных магазинов
                 */

                //Записываем в результирующий список первый магазин
                $resultShopsList[0] = $middleShop->toArray();
                //Получаем все существующие приоритетные магазины, кроме уже добавленного в результирующий список
                $priorityShops = Shop::where('is_priority', 1)->where('id', '!=', $middleShop->id);
                //Переводим в массив, в котором id магазина является ключем, а магазин - значением
                $priorityShopsArray = $priorityShops->get()->keyBy('id')->toArray();
                //Список id приоритетных магазинов
                $priorityShopsIds = $priorityShops->pluck('id');
                //Получаем список приоритетных магазинов для конкретного товара
                $priorityProudctShops = $product->shops()->where('is_priority', 1)->get()->keyBy('id')->toArray();
                //Добавляем в результирующий список либо магазин, либо ссылку на поиск по магазину
                foreach ($priorityShopsIds as $i => $priorityShopsId) {
                    if (isset($priorityProudctShops[$priorityShopsId])) {
                        //добавляются данные о магазине
                        $resultShopsList[$i+1] = $priorityProudctShops[$priorityShopsId];
                    } else {
                        //добавляются данные о поиске
                        $resultShopsList[$i+1] = $priorityShopsArray[$priorityShopsId];
                    }
                }


                $otherShops = $product->shops()->whereNotIn('shops.id', $priorityShopsIds)->where('shops.id', '!=', $middleShop->id)->get()->toArray();
                $resultShopsList = array_merge($resultShopsList, $otherShops);

                foreach ($resultShopsList as $i => $result) {
                    $resultShopsList[$i]['shop_search_url'] = Product::generateFakeSearchUrl($result['slug'], $product->id);
                    $resultShopsList[$i]['shop_url'] = Product::generateFakeUrl($result['slug'], $product->id);
                }
                return $resultShopsList;
            });
        }


        //Кеширование количества просмотров
        $viewsCache = \Cache::tags(['products', 'views']);

        $post = \Cache::tags(['products', 'single'])
            ->remember($productId, env('REDIS_PRODUCTS_CACHE_TIME'), function() use ($productId, $viewsCache) {
                // получаем запись
                $post = Product::findOrFail($productId);

                // пишем в базу число из кеша
                if(($views = $viewsCache->get($post->id, 0)) > $post->views) {
                    $post->views = $views;
                    $post->timestamps = false;
                    $post->save();
                    $post->timestamps = true;
                }

                // добавялем число в кеш
                $viewsCache->forever($post->id, $post->views);

                return $post;
            });

        $viewsCache->increment($post->id); // +1 просмотр
        $post->views = $viewsCache->get($post->id); // поместим актуальное число в модель

        return view('product', compact('product',
                'middleShop',
                'middleShopUrl',
                'middlePrice',
                'minPrice',
                'maxPrice',
                'shopsCount',
                'hars',
                'similarPoducts',
                'meta',
                'breadcrumbs',
                'reviews',
                'resultShopsList',
                'city'
            )
        );

    }

    //Удаление товара из магазина
    static function deleteShopFromProduct($productId)
    {
        if (\Request::ajax()) {
            $shopId = \request('shop-id');
            return Product::find($productId)->shops($shopId)->detach($shopId);
        }
    }

    //Добавление товара в магазин
    static function addShopToProduct($productId)
    {
        if (\Request::ajax()) {
            $shopId = \request('shop-id');
            $shopPrice = \request('shop-price');
            $shopUrl = \request('shop-url');

            $product = Product::findOrFail($productId);
            return $product->shops($shopId)->attach(array(1 => array('shop_id' => $shopId, 'price' => $shopPrice, 'url' => $shopUrl)));
        }
    }

    public function redirectToShop($shopSlug, $productId)
    {
        $shop = Product::select('shop_product.url as shop_url')
            ->leftJoin('shop_product', 'products.id', '=', 'shop_product.product_id')
            ->leftJoin('shops', 'shop_product.shop_id', '=', 'shops.id')
            ->where(['shops.slug' => $shopSlug, 'product_id' => $productId])
            ->first();

        return redirect($shop->shop_url);
    }

    public function redirectToShopSearch($shopSlug, $productId)
    {
        $shop = Shop::where('slug', $shopSlug)->first();
        $productName = Product::find($productId)->name;
        if (isset($shop->shop_search_url) && !empty($shop->shop_search_url)) {
            $shopSearchUrl =  str_replace("%%поисковый_запрос%%", $productName, $shop->shop_search_url);
            $shopSearchUrl = str_replace(" ", "+", $shopSearchUrl);
            return redirect($shopSearchUrl);
        }
    }
}
