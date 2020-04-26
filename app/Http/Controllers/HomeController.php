<?php

namespace App\Http\Controllers;

use App\Product;
use App\ProductArticle;
use App\City;
use Illuminate\Support\Facades\Cache;

class HomeController extends Controller
{
    public function index($subdomain=false) {

        if (Cache::has('home_popular_products')) {
            $popularProducts = Cache::get('home_popular_products');
        } else {
            $popularProducts = Cache::remember('home_popular_products', env('REDIS_HOME_PAGE_CACHE'), function() {
                return Product::getPopular();
            });
        }

        if (Cache::has('home_product_articles')) {
            $productArticles = Cache::get('home_product_articles');
        } else {
            $productArticles = Cache::remember('home_product_articles', env('REDIS_HOME_PAGE_CACHE'), function() {
                return ProductArticle::limit(7)->orderBy('created_at', 'DESC')->get();;
            });
        }

        $salesProducts = Product::where('old_price', '!=', '')
            ->whereNotNull('old_price')
            ->limit(20)
            ->get();
        foreach ($salesProducts as $salesProduct) {
            //Ссылка на товар в магазине
            $salesProduct->shop_url = Product::generateFakeUrl($salesProduct->shops[0]->slug, $salesProduct->id);
            $salesProduct->shop_name = $salesProduct->shops[0]->name;
        }

        if (Cache::has('home_sales_products')) {
            $salesProducts = Cache::get('home_sales_products');
        } else {
            $salesProducts = Cache::remember('home_sales_products', env('REDIS_HOME_PAGE_CACHE'), function() {
                $salesProducts = Product::where('old_price', '!=', '')
                    ->whereNotNull('old_price')
                    ->limit(20)
                    ->get();
                foreach ($salesProducts as $salesProduct) {
                    //Ссылка на товар в магазине
                    $salesProduct->shop_url = Product::generateFakeUrl($salesProduct->shops[0]->slug, $salesProduct->id);
                    $salesProduct->shop_name = $salesProduct->shops[0]->name;
                }
                return $salesProducts;
            });
        }

        $city = City::getCityNameFromSlug($subdomain);

        return view('home', compact(
                'popularProducts',
                'productArticles',
                'salesProducts',
                'city'
            )
        );
    }
}
