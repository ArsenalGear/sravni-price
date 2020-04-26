<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/




Route::group(['prefix' => 'admin'], function () {
    Voyager::routes();
    Route::post('/delete-shop-from-product/{product_id}', 'ProductController@deleteShopFromProduct');
    Route::post('/add-shop-to-product/{product_id}', 'ProductController@addShopToProduct');
});

Route::post('/get-items/{id?}', 'Voyager\VoyagerBaseController@getItems');
Route::post('/get-filter-options/{filter_type_id}', 'FilterController@getFilterOptions');
Route::post('/check-option-existanse/{filter_type_id}', 'FilterController@checkOptionExistance');


Route::domain('{subdomain}.'. env('APP_HOSTNAME'))->group(function ($subdomain) {
    Route::get('/', 'HomeController@index')->name('home');
    // Маршрут до товара
    Route::get('catalog/{category}/{product}', 'ProductController@index')
        ->where('category', '[&%=а-яА-Яa-zA-Z0-9\-/_]+')
        ->where('product', '[products]+/[&%=а-яА-Яa-zA-Z0-9_-]+')
        ->name('product');
    // Маршрут до раздела
    Route::get('catalog/{path}', 'CategoriesController@index')
        ->where('path', '[&%=а-яА-Яa-zA-Z0-9\-/_]+');
    // Маршрут до раздела
    Route::post('catalog/{path}', 'CategoriesController@index')
        ->where('path', '[&%=а-яА-Яa-zA-Z0-9\-/_]+');

    // Маршрут до товара со скидкой
    Route::get('sales/{category}/{product}', 'ProductController@index')
        ->where('category', '[&%=а-яА-Яa-zA-Z0-9\-/_]+')
        ->where('product', '[products]+/[&%=а-яА-Яa-zA-Z0-9_-]+')
        ->name('product');
    Route::post('sales/{category}/{product}', 'ProductController@index')
        ->where('category', '[&%=а-яА-Яa-zA-Z0-9\-/_]+')
        ->where('product', '[products]+/[&%=а-яА-Яa-zA-Z0-9_-]+')
        ->name('product');

    // Маршрут до раздела со скидками
    Route::get('sales/{path?}', 'CategoriesController@index')
        ->where('path', '[&%=а-яА-Яa-zA-Z0-9\-/_]+')
        ->name('sales-catalog');
    Route::post('sales/{path?}', 'CategoriesController@index')
        ->where('path', '[&%=а-яА-Яa-zA-Z0-9\-/_]+')
        ->name('sales-catalog');

    //Поиск
    Route::get('/search', 'SearchController@index');//Поиск
    Route::post('/search', 'SearchController@index');//Поиск

    Route::get('/obzory-tovarov/', 'ProductArticlesController@getProductArticlesList')->name('obzory-tovarov');
    Route::get('/obzory-tovarov/{product_article_slug}', 'ProductArticlesController@getProductArticle')->name('obzor');

});

Route::domain('{domain}.ru')->group(function ($domain) {
    Route::get('/', 'HomeController@index')->name('home');
// Маршрут до товара
    Route::get('catalog/{category}/{product}', 'ProductController@index')
        ->where('category', '[&%=а-яА-Яa-zA-Z0-9\-/_]+')
        ->where('product', '[products]+/[&%=а-яА-Яa-zA-Z0-9_-]+')
        ->name('product');
// Маршрут до раздела
    Route::get('catalog/{path}', 'CategoriesController@index')
        ->where('path', '[&%=а-яА-Яa-zA-Z0-9\-/_]+');
// Маршрут до раздела
    Route::post('catalog/{path}', 'CategoriesController@index')
        ->where('path', '[&%=а-яА-Яa-zA-Z0-9\-/_]+');

// Маршрут до товара со скидкой
    Route::get('sales/{category}/{product}', 'ProductController@index')
        ->where('category', '[&%=а-яА-Яa-zA-Z0-9\-/_]+')
        ->where('product', '[products]+/[&%=а-яА-Яa-zA-Z0-9_-]+')
        ->name('product');
    Route::post('sales/{category}/{product}', 'ProductController@index')
        ->where('category', '[&%=а-яА-Яa-zA-Z0-9\-/_]+')
        ->where('product', '[products]+/[&%=а-яА-Яa-zA-Z0-9_-]+')
        ->name('product');

// Маршрут до раздела со скидками
    Route::get('sales/{path?}', 'CategoriesController@index')
        ->where('path', '[&%=а-яА-Яa-zA-Z0-9\-/_]+')
        ->name('sales-catalog');
    Route::post('sales/{path?}', 'CategoriesController@index')
        ->where('path', '[&%=а-яА-Яa-zA-Z0-9\-/_]+')
        ->name('sales-catalog');

//Поиск
    Route::get('/search', 'SearchController@index');//Поиск
    Route::post('/search', 'SearchController@index');//Поиск

    Route::get('/obzory-tovarov/', 'ProductArticlesController@getProductArticlesList')->name('obzory-tovarov');
    Route::get('/obzory-tovarov/{product_article_slug}', 'ProductArticlesController@getProductArticle')->name('obzor');
});

Route::get('/get-custom-relationship-items-list', 'Voyager\VoyagerBaseController@getCustomRelationshipItemsList');

//Добавление парсинга csv и csv со скидками в очередь
Route::post('add-csv-to-queue/{shop_id}', 'CsvImportController@addCsvToQueue');
Route::post('add-sales-csv-to-queue/{shop_id}', 'CsvImportController@addSalesCsvToQueue');

Route::post('/import-categories-mappings-csv', 'CategoriesController@importCategoriesMappingsCsv');

Route::post('/get-more-options/{category_id}', 'FilterController@getMoreOptions');
Route::post('/get-more-filters/{category_id}', 'FilterController@getMoreFilters');

//Показать/скрыть комментарий в товаре из админ-панели
Route::post('/approve-review/{review_id}', 'Voyager\VoyagerBaseController@approveReview');


//Сообщения из форм на почту
Route::post('/subscribe', 'NotificationsController@subscribe');
Route::post('/feedback', 'NotificationsController@feedback');
Route::post('/create-review/{product_id}', 'ReviewsController@createReview');

//Редирект на товар в магазине (непрямая ссылка для SEO)
Route::get('/buy/{shop_slug}/{product_id}', 'ProductController@redirectToShop');
Route::get('/shop-search/{shop_slug}/{product_id}', 'ProductController@redirectToShopSearch');



//Получить список регионов
Route::post('/get-regions', 'CitiesController@getRegions');
//Получить города по id региона
Route::post('/get-cities-by-region-id/{region_id}', 'CitiesController@getCitiesByRegionId');

//Для всех ненайденных роутов
Route::get('/{ifRouteNotFound}', function () {
    return abort(404);
});


