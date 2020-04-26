<?php

namespace App\Http\Controllers;

use App\Category;
use App\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Input;
use App\City;

class SearchController extends Controller
{
    public function index(Request $request, $subdomain=false)
    {
        /*
         * Необходимо получить:
         * хлебные крошки
         * подкатегории
         * товары
         * вывести пагинацию
         */

        //Получаем товары данной категории и всех подкатегорий
        $searchQuery = $request->get('query');

        if (!empty($searchQuery)) {
            $products = Product::where('name', 'like', '%' . $searchQuery . '%');

        $categories = Product::
            leftJoin('category_product', 'products.id', '=', 'category_product.product_id')
            ->leftJoin('categories', 'categories.id', '=', 'category_product.category_id')
            ->select(DB::raw('COUNT(DISTINCT products.id) as products_count'), 'categories.id', 'categories.name', 'categories.path')
            ->distinct()
            ->whereIn('product_id', $products->pluck('id'))
            ->groupBy('categories.name')
            ->get();

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

            $productsCount = $products->count();

            $products = $products->paginate(9)->onEachSide(1);
        }


        foreach ($categories as $subcat) {
            //Получаем все id подкатегорий этой категории
            $categorySubcatIds = Category::find($subcat->id)->descendants()->pluck('id');
            if (!empty($categorySubcatIds)) {
                $subcatsCount = Product::leftJoin('category_product', 'category_product.product_id', '=', 'products.id')
                    ->whereIn('category_product.category_id', $categorySubcatIds)
                    ->count();
                $subcat->products_count = $subcatsCount + $subcat->products_count;
            }

        }

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


        foreach ($products as $product) {
            $product->category_url = $product->category[0]->getAttribute('path') . '/products/' . $product->slug;
        }

        if ($request->ajax()) {
            return ['ok' => 1, 'items' => $products->items(), 'pagination' => strval($products->links('vendor/pagination/default'))];
        }

        $products->appends(Input::except('page'));

        $city = City::getCityNameFromSlug($subdomain);

        return view('search', compact(
                'categories',
                'products',
                'productsCount',
                'priceSort',
                'newSort',
                'popularSort',
                'city'
            )
        );
    }
}
