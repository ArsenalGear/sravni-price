<?php

namespace App\Http\Controllers;

use App\ProductArticle;
use App\City;
use Illuminate\Support\Facades\Cache;

class ProductArticlesController extends Controller
{
    public function getProductArticlesList($subdomain)
    {
        $productArticlesMainArticleCacheName = 'product_articles_main_article_cache';
        if (Cache::has($productArticlesMainArticleCacheName)) {
            $mainProductArticle = Cache::get($productArticlesMainArticleCacheName);
        } else {
            $mainProductArticle = Cache::remember($productArticlesMainArticleCacheName, env('REDIS_PRODUCT_ARTICLES_CACHE_TIME'), function() {
                return ProductArticle::orderBy('created_at', 'DESC')->first();
            });
        }

        $currentPage = (!empty(request('page'))) ? request('page') : 1;
        $productArticlesListCacheName = 'product_articles_list_page_' . $currentPage;
        if (Cache::has($productArticlesListCacheName)) {
            $productArticlesList = Cache::get($productArticlesListCacheName);
        } else {
            $productArticlesList = Cache::remember($productArticlesListCacheName, env('REDIS_PRODUCT_ARTICLES_CACHE_TIME'), function() use ($mainProductArticle) {
                return ProductArticle::where('id', '!=', $mainProductArticle->id)->paginate(12)->onEachSide(1);
            });
        }

        $city = City::getCityNameFromSlug($subdomain);
        return view('product-articles-list', compact(
                'mainProductArticle',
                'productArticlesList',
                'city'
            )
        );
    }

    public function getProductArticle($subdomain, $productArticleSlug)
    {
        $productArticleCacheName = 'product_article_' . $productArticleSlug;
        if (Cache::has($productArticleCacheName)) {
            $productArticle = Cache::get($productArticleCacheName);
        } else {
            $productArticle = Cache::remember($productArticleCacheName, env('REDIS_PRODUCT_ONE_ARTICLE_CACHE_TIME'), function() use ($productArticleSlug) {
                return ProductArticle::where('slug', $productArticleSlug)->first();
            });
        }

        $city = City::getCityNameFromSlug($subdomain);
        return view('product-article-page', compact('productArticle', 'city'));
    }
}
