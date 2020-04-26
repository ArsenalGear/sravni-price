<?php

namespace App\Http\Controllers;

use App\FilterType;
use App\Jobs\ImportCategoriesMappingsCsv;
use App\Product;
use App\ProductFilterTypeFilterOption;
use App\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Input;
use App\City;

class CategoriesController extends Controller
{
    public $isSalesPage = false; //это - страница скидок

    public function index(Request $request, $subdomain=false, $path="")
    {
        /*
         * Необходимо получить:
         * хлебные крошки
         * подкатегории
         * товары
         * вывести пагинацию
         */

        //Для обычных категорий в адресной строке добавляется /catalog/, а для категорий со скидками /sales/
        if (\Request::route()->getName() == "sales-catalog") {
            $this->isSalesPage = true;
        }

        //Страница sales
        if (empty($path) && $this->isSalesPage) {
            $subcats = Category::where('parent_id', '')
                ->orWhere('parent_id', null)
                ->get();
        } else {
            $category = Category::where('path', $path);
            if (!$category->exists()) {
                abort(404);
            }
            $category = Category::find($category->first()->id);

            //Для хлебных крошек
            $subcats = $category->categoryChildren()->select('id', 'name', 'path');

            if ($this->isSalesPage) {
                $subcats = $subcats->withCount(['products' => function($query) {
                    $query->where('old_price', '!=', '')->whereNotNull('old_price');
                }])->get();
            } else {
                $subcats = $subcats->withCount('products')->get();
            }
        }

        //Для каждой подкатегории отдельно нужно получить входящие в неё катеории
        foreach ($subcats as $subcat) {
            $categorySubcatIds = Category::find($subcat->id)->descendants()->pluck('id');
            $subcatsProducts = Product::leftJoin('category_product', 'category_product.product_id', '=', 'products.id');

            if ($this->isSalesPage) {
                $subcatsProducts = $subcatsProducts->where('old_price', '!=', '')->whereNotNull('old_price');
            }

            $subcatsProducts = $subcatsProducts->whereIn('category_product.category_id', $categorySubcatIds)
                ->pluck('product_id')->unique();
            $subcatsCount = $subcatsProducts->count();
            $subcat->products_count = $subcatsCount + $subcat->products_count;
        }

        foreach ($subcats as $i => $subcat) {
            if ($subcat->products_count == 0) {
                unset($subcats[$i]);
            }
        }

        //Страница sales
        if (empty($path) && $this->isSalesPage) {
            $products = Product::where('old_price', '!=', '')->whereNotNull('old_price');
            $productsCount = $products->count();
            $priceSort = 'desc';
            $newSort = 'desc';
            $popularSort = 'desc';
            switch ($request->get('sort')) {
                case 'price-asc':
                    $products = $products->orderBy('min_price', 'ASC');
                    break;
                case 'price-desc':
                    $products = $products->orderBy('min_price', 'DESC');
                    break;
                case 'new-asc':
                    $products = $products->orderBy('created_at', 'ASC');
                    break;
                case 'new-desc':
                    $products = $products->orderBy('created_at', 'DESC');
                    break;
                case 'popular-asc':
                    $products = $products->orderBy('views', 'ASC');
                    break;
                case 'popular-desc':
                    $products = $products->orderBy('views', 'DESC');
                    break;
            }




            $products = $products->paginate(9)->onEachSide(1);
            //Получаем url категории с подкатегориями, в которой лежит товар
            foreach ($products->items() as $product) {
                $product->category_url = $product->category[0]->getAttribute('path') . "/products/" . $product->slug;
            }

            if ($request->ajax()) {
                return ['ok' => 1, 'items' => $products->items(), 'pagination' => strval($products->links('vendor/pagination/default'))];
            }

            $city = City::getCityNameFromSlug($subdomain);

            //Шаблон title и description для товаров со скидками
            $meta['title'] = setting('site.meta_title_categories_sales');
            $meta['title'] = str_replace('[NAME]', "Скидки", $meta['title']);
            $meta['description'] = setting('site.meta_description_categories_sales');
            $meta['description'] = str_replace('[NAME]', "Скидки", $meta['description']);

            return view('sales-main-page', compact(
                    'products',
                    'subcats',
                    'productsCount',
                    'priceSort',
                    'newSort',
                    'popularSort',
                    'meta',
                    'city'
                )
            );
        }

        //id всех подкатегорий с глубокой вложенностью
        $subcatsIds = $category->descendants()->pluck('id');
        $subcatsIds[] = $category->id;
        $subcatsIds = $subcatsIds->unique();

        //Получаем товары данной категории и всех подкатегорий
        $products = Product::leftJoin('category_product', 'category_product.product_id', '=', 'products.id')
            ->whereIn('category_product.category_id', $subcatsIds);

        if ($this->isSalesPage) {
            $products = $products->where('old_price', '!=', '')->whereNotNull('old_price');
        }

        //Записываем соответствия товарав категории, т.к. после пагинации эти значения не сохраняются
        foreach ($products->get() as $product) {
            $productCategories[$product->product_id] = $product->category_id;
        }

        $productIds = $products->pluck('products.id')->toArray();

        $products = Product::whereIn('id', $productIds);


        if($category->parent()->exists()) {
            $maxPrice = $products->max('min_price');
            $minPrice = $products->min('min_price');
            //Первые пять фильтров
            $filter = FilterType::getCategoryFilters($productIds, 1);
            //Первые пять брендов
            $brands = Category::getCategoryBrands($productIds, 1);
        } else {
            $maxPrice = 9999999;
            $minPrice = 0;
        }

        $productsCount = $products->count();

        //Фильтрация и ajax пагинация
        $filterDataArr = $request->all();

        if (!empty($filterDataArr)) {

            //Извлекаем данные из переданных массивов в виде vendors[]=3,4
            foreach ($filterDataArr as $paramKey => $paramValue) {
                if (is_array($paramValue)) {
                    foreach ($paramValue as $i => $value) {
                        if(!stristr($value, ',') === FALSE) {
                            $dataValues = explode(',', $value);
                            unset($filterDataArr[$paramKey][$i]);
                            foreach ($dataValues as $dataValue) {
                                $filterDataArr[$paramKey][] = $dataValue;
                            }
                        }
                    }
                }
            }

            //Эти параметры обрабатываются отдельно от остальных
            $unsetIfExists = ['page', 'vendors', 'min_price', 'max_price', 'sort'];
            foreach ($unsetIfExists as $optionName) {
                if (isset($filterDataArr[$optionName])) {
                  unset($filterDataArr[$optionName]);
                }
            }

            //Бренды и цены
            if (\request('vendors')) {
                $vendors = $request->get('vendors');

                foreach ($vendors as $i => $vendor) {
                    if(!stristr($vendor, ',') === FALSE) {
                        $vendorValues = explode(',', $vendor);
                        unset($vendors[$i]);
                        foreach ($vendorValues as $vendorValue) {
                            $vendors[] = $vendorValue;
                        }
                    }
                }

                $productIdsVendors = Product::whereIn('id', $productIds)
                    ->whereIn('vendor_id', $vendors)
                    ->pluck('products.id')
                    ->unique();
            }

            if (empty($request->get('min_price'))) {
                $priceFrom = 0;
            } else {
                $priceFrom = $request->get('min_price');
            }

            if (empty($request->get('max_price'))) {
                $priceTo = 9999999999;
            } else {
                $priceTo = $request->get('max_price');
            }

            $productIdsPrices = Product::whereIn('products.id', $productIds)
                ->whereBetween('products.min_price', array($priceFrom, $priceTo))
                ->pluck('products.id')
                ->unique();

            if (!empty($filterDataArr)) {
                $productFilterTypeFilterOption = ProductFilterTypeFilterOption::
                leftJoin('filter_types', 'product_filter_type_filter_option.filter_type_id', 'filter_types.id')
                    ->leftJoin('filter_options', 'product_filter_type_filter_option.filter_option_id', 'filter_options.id')
                    ->whereIn('product_id', $productIds);

                foreach ($filterDataArr as $filterTypeSlug => $optionIds) {
                    if (!empty($optionIds)) {
                        $productFilterTypeFilterOption = $productFilterTypeFilterOption
                            ->where('filter_types.slug', $filterTypeSlug)
                            ->whereIn('filter_options.slug', $optionIds);
                    }
                }

                $productIds = $productFilterTypeFilterOption->pluck('product_id')->unique()->toArray();

            }

            if (isset($productIdsVendors) && !empty($productIdsVendors)) {
                $productIds =  array_values(array_unique(array_intersect($productIds, $productIdsVendors->toArray())));
            }

            if (isset($productIdsPrices) && !empty($productIdsPrices)) {
                $productIds =  array_values(array_unique(array_intersect($productIds, $productIdsPrices->toArray())));
            }

            unset($products);

            $products = Product::whereIn('id', $productIds); //плюс бренд и цена

            //сортировка
            switch ($request->get('sort')) {
                case 'price-asc':
                    $products = $products->orderBy('min_price', 'ASC');
                break;
                case 'price-desc':
                    $products = $products->orderBy('min_price', 'DESC');
                break;
                case 'new-asc':
                    $products = $products->orderBy('created_at', 'ASC');
                break;
                case 'new-desc':
                    $products = $products->orderBy('created_at', 'DESC');
                break;
                case 'popular-asc':
                    $products = $products->orderBy('views', 'ASC');
                break;
                case 'popular-desc':
                    $products = $products->orderBy('views', 'DESC');
                break;
            }

            $products = $products->paginate(9)->onEachSide(1);
            //Получаем url категории с подкатегориями, в которой лежит товар
            foreach ($products as $product) {
                $product->category_url = Category::find($productCategories[$product->id])->getAttribute('path') . "/products/" . $product->slug;
            }
            if ($request->ajax()) {
                return ['ok' => 1, 'items' => $products->items(), 'pagination' => strval($products->links('vendor/pagination/default'))];
            }
        } else {
            $products = $products->paginate(9)->onEachSide(1);
            //Получаем url категории с подкатегориями, в которой лежит товар
            foreach ($products as $product) {
                $product->category_url = Category::find($productCategories[$product->id])->getAttribute('path') . "/products/" . $product->slug;
            }
            if ($request->ajax()) {
                return ['ok' => 1, 'items' => $products->items(), 'pagination' => strval($products->links('vendor/pagination/default'))];
            }
        }

        //Генерация фильтра
        //Максимальная цена

        $maxPriceSelected = (!empty(\request('max_price'))) ? \request('max_price') : $maxPrice;
        $minPriceSelected = (!empty(\request('min_price'))) ? \request('min_price') : $minPrice;


        //Фикс, чтобы в шаблоне пагинации в ссылки добавлялись GET параметры, если они присутствуют
        $products->appends(Input::except('page'));

        $priceSort = 'desc';
        $newSort = 'desc';
        $popularSort = 'desc';
        if (!empty(\request('sort'))) {
            $explodedSort = explode('-', \request('sort'));
            switch ($explodedSort[0]) {
                case "price":
                    $priceSort = $explodedSort[1];
                break;
                case "new":
                    $newSort = $explodedSort[1];
                break;
                case "popular":
                    $popularSort = $explodedSort[1];
                break;
            }
        }

        $breadcrumbs = $this->makeBreadcrumbs($path);
        if ($this->isSalesPage) {
            $breadcrumbs = array_reverse($breadcrumbs);
            $breadcrumbs[] = ['name' => 'Скидки', 'slug' => 'sales', 'url' => '', 'last' => false];
            $breadcrumbs = array_reverse($breadcrumbs);
        }

        if (!empty($category->meta_title)) {
            $meta['title'] = $category->meta_title;
        }

        if (!empty($category->meta_description)) {
            $meta['description'] = $category->meta_description;
        }

        //Получаем url категории с подкатегориями, в которой лежит товар
         foreach ($products as $product) {
             if (!isset($product->category_url) || empty($product->category_url)) {
                 $product->category_url = Category::find($productCategories[$product->product_id])->getAttribute('path') . "/products/" . $product->slug;
             }
         }

        $catalogAlias = $this->isSalesPage ? 'sales' : 'catalog';
        $isSales = $this->isSalesPage ? "true" : "false";
        $city = City::getCityNameFromSlug($subdomain);


        if (!empty($category->meta_title)) {
            $meta['title'] = $category->meta_title;
        } else {
            if ($this->isSalesPage) {
                //Стандартный title для категорий со скидками
                $meta['title'] = setting('site.meta_title_categories_sales');
            } else {
                //Стандартный title для категорий без скидок
                $meta['title'] = setting('site.meta_title_categories');
            }
            $meta['title'] = str_replace('[NAME]', $category->name, $meta['title']);
        }

        //description
        if (!empty($category->meta_description)) {
            $meta['description'] = $category->meta_description;
        } else {
            if ($this->isSalesPage) {
                //Стандартный description для категорий со скидками
                $meta['description'] = setting('site.meta_description_categories_sales');
            } else {
                //Стандартный description для категорий без скидок
                $meta['description'] = setting('site.meta_description_categories');
            }
            $meta['description'] = str_replace('[NAME]', $category->name, $meta['description']);
        }


        return view('category', compact(
                'category',
                'products',
                'breadcrumbs',
                'subcats',
                'meta',
                'productsCount',
                'filter',
                'brands',
                'maxPrice',
                'maxPriceSelected',
                'minPrice',
                'minPriceSelected',
                'priceSort',
                'newSort',
                'popularSort',
                'catalogAlias',
                'isSales',
                'city'
            )
        );
    }

    public function makeBreadcrumbs($path)
    {
        $aliases = explode('/', $path);
        $breadcrumbs = Category::select('name', 'slug')
            ->whereIn('slug', $aliases)
            ->get()
            ->keyBy('slug')
            ->toArray();

        $breadcrumbsCount = count($aliases);
        foreach ($aliases as $i => $alias) {
            $slugs[] = $breadcrumbs[$alias]['slug'];
            $breadcrumbsArr[$i]['name'] = $breadcrumbs[$alias]['name'];
            $breadcrumbsArr[$i]['slug'] = $breadcrumbs[$alias]['slug'];
            $breadcrumbsArr[$i]['url'] = implode('/',  $slugs);
            $breadcrumbsArr[$i]['last'] = ($i == $breadcrumbsCount - 1) ? true : false;
        }

        return $breadcrumbsArr;
    }
}
