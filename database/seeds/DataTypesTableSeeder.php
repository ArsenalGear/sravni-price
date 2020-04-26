<?php

use Illuminate\Database\Seeder;
use TCG\Voyager\Models\DataType;

class DataTypesTableSeeder extends Seeder
{
    /**
     * Auto generated seed file.
     */
    public function run()
    {
        $dataType = $this->dataType('name', 'users');
        if (!$dataType->exists) {
            $dataType->fill([
                'slug'                  => 'users',
                'display_name_singular' => __('voyager::seeders.data_types.user.singular'),
                'display_name_plural'   => __('voyager::seeders.data_types.user.plural'),
                'icon'                  => 'voyager-person',
                'model_name'            => 'TCG\\Voyager\\Models\\User',
                'policy_name'           => 'TCG\\Voyager\\Policies\\UserPolicy',
                'controller'            => 'TCG\\Voyager\\Http\\Controllers\\VoyagerUserController',
                'generate_permissions'  => 1,
                'description'           => '',
            ])->save();
        }

        $dataType = $this->dataType('name', 'menus');
        if (!$dataType->exists) {
            $dataType->fill([
                'slug'                  => 'menus',
                'display_name_singular' => __('voyager::seeders.data_types.menu.singular'),
                'display_name_plural'   => __('voyager::seeders.data_types.menu.plural'),
                'icon'                  => 'voyager-list',
                'model_name'            => 'TCG\\Voyager\\Models\\Menu',
                'controller'            => '',
                'generate_permissions'  => 1,
                'description'           => '',
            ])->save();
        }

        $dataType = $this->dataType('name', 'roles');
        if (!$dataType->exists) {
            $dataType->fill([
                'slug'                  => 'roles',
                'display_name_singular' => __('voyager::seeders.data_types.role.singular'),
                'display_name_plural'   => __('voyager::seeders.data_types.role.plural'),
                'icon'                  => 'voyager-lock',
                'model_name'            => 'TCG\\Voyager\\Models\\Role',
                'controller'            => '',
                'generate_permissions'  => 1,
                'description'           => '',
            ])->save();
        }

        $dataType = $this->dataType('name', 'categories');
        if (!$dataType->exists) {
            $dataType->fill([
                'slug'                  => 'categories',
                'display_name_singular' => 'Категория',
                'display_name_plural'   => 'Категории',
                'icon'                  => 'voyager-categories',
                'model_name'            => 'App\Category',
                'controller'            => '',
                'generate_permissions'  => 1,
                'description'           => '',
            ])->save();
        }

        $dataType = $this->dataType('name', 'shops');
        if (!$dataType->exists) {
            $dataType->fill([
                'slug'                  => 'shops',
                'display_name_singular' => 'Магазин',
                'display_name_plural'   => 'Магазины',
                'icon'                  => 'voyager-shop',
                'model_name'            => 'App\\Shop',
                'controller'            => '',
                'generate_permissions'  => 1,
                'description'           => '',
            ])->save();
        }

        $dataType = $this->dataType('name', 'vendors');
        if (!$dataType->exists) {
            $dataType->fill([
                'slug'                  => 'vendors',
                'display_name_singular' => 'Бренд',
                'display_name_plural'   => 'Бренды',
                'icon'                  => 'voyager-company',
                'model_name'            => 'App\\Vendor',
                'controller'            => '',
                'generate_permissions'  => 1,
                'description'           => '',
            ])->save();
        }

        $dataType = $this->dataType('name', 'products');
        if (!$dataType->exists) {
            $dataType->fill([
                'slug'                  => 'products',
                'display_name_singular' => 'Товар',
                'display_name_plural'   => 'Товары',
                'icon'                  => 'voyager-buy',
                'model_name'            => 'App\\Product',
                'controller'            => '',
                'generate_permissions'  => 1,
                'description'           => '',
            ])->save();
        }

        $dataType = $this->dataType('name', 'custom_menus');
        if (!$dataType->exists) {
            $dataType->fill([
                'slug'                  => 'custom-menus',
                'display_name_singular' => 'Пункт меню',
                'display_name_plural'   => 'Пункты меню',
                'icon'                  => 'voyager-list',
                'model_name'            => 'App\\CustomMenu',
                'controller'            => '',
                'generate_permissions'  => 1,
                'description'           => '',
            ])->save();
        }

        $dataType = $this->dataType('name', 'filter_types');
        if (!$dataType->exists) {
            $dataType->fill([
                'slug'                  => 'filter-types',
                'display_name_singular' => 'Тип фильтра',
                'display_name_plural'   => 'Типы фильтров',
                'icon'                  => '',
                'model_name'            => 'App\\FilterType',
                'controller'            => '',
                'generate_permissions'  => 1,
                'description'           => '',
            ])->save();
        }

        $dataType = $this->dataType('name', 'reviews');
        if (!$dataType->exists) {
            $dataType->fill([
                'slug'                  => 'reviews',
                'display_name_singular' => 'Отзыв',
                'display_name_plural'   => 'Отзывы',
                'icon'                  => '',
                'model_name'            => 'App\\Review',
                'controller'            => '',
                'generate_permissions'  => 1,
                'description'           => '',
            ])->save();
        }

        $dataType = $this->dataType('name', 'product_articles');
        if (!$dataType->exists) {
            $dataType->fill([
                'slug'                  => 'product-articles',
                'display_name_singular' => 'Обзор товара',
                'display_name_plural'   => 'Обзоры товаров',
                'icon'                  => '',
                'model_name'            => 'App\\ProductArticle',
                'controller'            => '',
                'generate_permissions'  => 1,
                'description'           => '',
            ])->save();
        }

        $dataType = $this->dataType('name', 'cities');
        if (!$dataType->exists) {
            $dataType->fill([
                'slug'                  => 'cities',
                'display_name_singular' => 'Город',
                'display_name_plural'   => 'Города',
                'icon'                  => '',
                'model_name'            => 'App\\City',
                'controller'            => '',
                'generate_permissions'  => 1,
                'description'           => '',
            ])->save();
        }

        $dataType = $this->dataType('name', 'regions');
        if (!$dataType->exists) {
            $dataType->fill([
                'slug'                  => 'regions',
                'display_name_singular' => 'Регион',
                'display_name_plural'   => 'Регионы',
                'icon'                  => '',
                'model_name'            => 'App\\Region',
                'controller'            => '',
                'generate_permissions'  => 1,
                'description'           => '',
            ])->save();
        }

    }

    /**
     * [dataType description].
     *
     * @param [type] $field [description]
     * @param [type] $for   [description]
     *
     * @return [type] [description]
     */
    protected function dataType($field, $for)
    {
        return DataType::firstOrNew([$field => $for]);
    }
}
