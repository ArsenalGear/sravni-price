<?php

use Illuminate\Database\Seeder;
use TCG\Voyager\Models\Setting;

class SettingsTableSeeder extends Seeder
{
    /**
     * Auto generated seed file.
     */
    public function run()
    {
        $setting = $this->findSetting('site.home_title');
        if (!$setting->exists) {
            $setting->fill([
                'display_name' => "Мета Title главной страницы",
                'value'        => "SravniPrice",
                'details'      => '',
                'type'         => 'text',
                'order'        => 1,
                'group'        => 'Site',
            ])->save();
        }

        $setting = $this->findSetting('site.home_description');
        if (!$setting->exists) {
            $setting->fill([
                'display_name' => "Мета Description главной страницы",
                'value'        => "SravniPrice",
                'details'      => '',
                'type'         => 'text',
                'order'        => 2,
                'group'        => 'Site',
            ])->save();
        }

        $setting = $this->findSetting('site.notifications_email');
        if (!$setting->exists) {
            $setting->fill([
                'display_name' => "Email для получения оповещений с сайта (желательно gmail)",
                'value'        => '',
                'details'      => '',
                'type'         => 'text',
                'order'        => 3,
                'group'        => 'Site',
            ])->save();
        }

        $setting = $this->findSetting('site.meta_title_products');
        if (!$setting->exists) {
            $setting->fill([
                'display_name' => "Шаблон title для товаров основного раздела (доступны переменные [NAME], [PRICE], [CITY-FIRST-FORM], [CITY-SECOND-FORM])",
                'value'        => '',
                'details'      => '',
                'type'         => 'text_area',
                'order'        => 4,
                'group'        => 'Site',
            ])->save();
        }

        $setting = $this->findSetting('site.meta_description_products');
        if (!$setting->exists) {
            $setting->fill([
                'display_name' => "Шаблон description для товаров основного раздела (доступны переменные [NAME], [PRICE], [CITY-FIRST-FORM], [CITY-SECOND-FORM])",
                'value'        => '',
                'details'      => '',
                'type'         => 'text_area',
                'order'        => 5,
                'group'        => 'Site',
            ])->save();
        }

        $setting = $this->findSetting('site.meta_title_products_sales');
        if (!$setting->exists) {
            $setting->fill([
                'display_name' => "Шаблон title для товаров со скидками (доступны переменные [NAME], [PRICE], [OLDPRICE], [CITY-FIRST-FORM], [CITY-SECOND-FORM])",
                'value'        => '',
                'details'      => '',
                'type'         => 'text_area',
                'order'        => 6,
                'group'        => 'Site',
            ])->save();
        }

        $setting = $this->findSetting('site.meta_description_products_sales');
        if (!$setting->exists) {
            $setting->fill([
                'display_name' => "Шаблон description для товаров со скидками (доступны переменные [NAME], [PRICE], [OLDPRICE], [CITY-FIRST-FORM], [CITY-SECOND-FORM])",
                'value'        => '',
                'details'      => '',
                'type'         => 'text_area',
                'order'        => 7,
                'group'        => 'Site',
            ])->save();
        }

        $setting = $this->findSetting('site.meta_title_categories');
        if (!$setting->exists) {
            $setting->fill([
                'display_name' => "Шаблон title для категорий (доступны переменные [NAME])",
                'value'        => '',
                'details'      => '',
                'type'         => 'text_area',
                'order'        => 8,
                'group'        => 'Site',
            ])->save();
        }

        $setting = $this->findSetting('site.meta_title_categories_sales');
        if (!$setting->exists) {
            $setting->fill([
                'display_name' => "Шаблон title для категорий со скидками (доступны переменные [NAME])",
                'value'        => '',
                'details'      => '',
                'type'         => 'text_area',
                'order'        => 9,
                'group'        => 'Site',
            ])->save();
        }

        $setting = $this->findSetting('site.meta_description_categories');
        if (!$setting->exists) {
            $setting->fill([
                'display_name' => "Шаблон description для категорий (доступны переменные [NAME])",
                'value'        => '',
                'details'      => '',
                'type'         => 'text_area',
                'order'        => 10,
                'group'        => 'Site',
            ])->save();
        }

        $setting = $this->findSetting('site.meta_description_categories_sales');
        if (!$setting->exists) {
            $setting->fill([
                'display_name' => "Шаблон description для категорий со скидками (доступны переменные [NAME])",
                'value'        => '',
                'details'      => '',
                'type'         => 'text_area',
                'order'        => 11,
                'group'        => 'Site',
            ])->save();
        }

        /*$setting = $this->findSetting('site.logo');
        if (!$setting->exists) {
            $setting->fill([
                'display_name' => __('voyager::seeders.settings.site.logo'),
                'value'        => '',
                'details'      => '',
                'type'         => 'image',
                'order'        => 3,
                'group'        => 'Site',
            ])->save();
        }

        $setting = $this->findSetting('site.google_analytics_tracking_id');
        if (!$setting->exists) {
            $setting->fill([
                'display_name' => __('voyager::seeders.settings.site.google_analytics_tracking_id'),
                'value'        => '',
                'details'      => '',
                'type'         => 'text',
                'order'        => 4,
                'group'        => 'Site',
            ])->save();
        }

        $setting = $this->findSetting('admin.bg_image');
        if (!$setting->exists) {
            $setting->fill([
                'display_name' => __('voyager::seeders.settings.admin.background_image'),
                'value'        => '',
                'details'      => '',
                'type'         => 'image',
                'order'        => 5,
                'group'        => 'Admin',
            ])->save();
        }

        $setting = $this->findSetting('admin.title');
        if (!$setting->exists) {
            $setting->fill([
                'display_name' => __('voyager::seeders.settings.admin.title'),
                'value'        => 'Voyager',
                'details'      => '',
                'type'         => 'text',
                'order'        => 1,
                'group'        => 'Admin',
            ])->save();
        }

        $setting = $this->findSetting('admin.description');
        if (!$setting->exists) {
            $setting->fill([
                'display_name' => __('voyager::seeders.settings.admin.description'),
                'value'        => __('voyager::seeders.settings.admin.description_value'),
                'details'      => '',
                'type'         => 'text',
                'order'        => 2,
                'group'        => 'Admin',
            ])->save();
        }

        $setting = $this->findSetting('admin.loader');
        if (!$setting->exists) {
            $setting->fill([
                'display_name' => __('voyager::seeders.settings.admin.loader'),
                'value'        => '',
                'details'      => '',
                'type'         => 'image',
                'order'        => 3,
                'group'        => 'Admin',
            ])->save();
        }

        $setting = $this->findSetting('admin.icon_image');
        if (!$setting->exists) {
            $setting->fill([
                'display_name' => __('voyager::seeders.settings.admin.icon_image'),
                'value'        => '',
                'details'      => '',
                'type'         => 'image',
                'order'        => 4,
                'group'        => 'Admin',
            ])->save();
        }

        $setting = $this->findSetting('admin.google_analytics_client_id');
        if (!$setting->exists) {
            $setting->fill([
                'display_name' => __('voyager::seeders.settings.admin.google_analytics_client_id'),
                'value'        => '',
                'details'      => '',
                'type'         => 'text',
                'order'        => 1,
                'group'        => 'Admin',
            ])->save();
        }*/
    }

    /**
     * [setting description].
     *
     * @param [type] $key [description]
     *
     * @return [type] [description]
     */
    protected function findSetting($key)
    {
        return Setting::firstOrNew(['key' => $key]);
    }
}
