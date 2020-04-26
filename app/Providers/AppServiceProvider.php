<?php

namespace App\Providers;

use Illuminate\Routing\Route;
use Illuminate\Support\ServiceProvider;
use App\CustomMenu;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Schema;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        if (strpos ($this->app->request->getRequestUri(), 'admin') === false) {
            if(Schema::hasTable('custom_menus')) {
                View::share('menu', CustomMenu::getMenuItems());
            }
        };
    }
}
