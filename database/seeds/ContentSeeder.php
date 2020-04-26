<?php

use Illuminate\Database\Seeder;

class ContentSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        //Создание категорий

        //Создадим папку storage/app/public/custom-menus/seeding
        //Создадим папку storage/app/public/products/seeding

        Storage::disk('local')->makeDirectory("public/custom-menus/seeding", '0777');
        Storage::disk('local')->makeDirectory("public/products/seeding", '0777');

        #CATEGORY
        DB::table('categories')->insert([
            [ 'id' => 1, 'order' => 1, 'name' => 'Бытовая техника', 'slug' => 'bytovaya-tehnika', 'path' => 'bytovaya-tehnika', 'path_names' => 'Бытовая техника', 'created_at' => date("Y-m-d H:i:s"), 'updated_at' => date("Y-m-d H:i:s")],
            [ 'id' => 2, 'order' => 1, 'name' => 'Спорт и туризм', 'slug' => 'sport-i-turizm', 'path' => 'sport-i-turizm', 'path_names' => 'Спорт и туризм', 'created_at' => date("Y-m-d H:i:s"), 'updated_at' => date("Y-m-d H:i:s")],
            [ 'id' => 3, 'order' => 1, 'name' => 'Аудио, видео, фото', 'slug' => 'audio-video-foto', 'path' => 'audio-video-foto', 'path_names' => 'Аудио, видео, фото', 'created_at' => date("Y-m-d H:i:s"), 'updated_at' => date("Y-m-d H:i:s")],
            [ 'id' => 4, 'order' => 1, 'name' => 'Мобильная связь', 'slug' => 'mobil-naya-svyaz', 'path' => 'mobil-naya-svyaz', 'path_names' => 'Мобильная связь', 'created_at' => date("Y-m-d H:i:s"), 'updated_at' => date("Y-m-d H:i:s")],
            [ 'id' => 5, 'order' => 1, 'name' => 'Всё для дома', 'slug' => 'vsyo-dlya-doma', 'path' => 'vsyo-dlya-doma', 'path_names' => 'Всё для дома',  'created_at' => date("Y-m-d H:i:s"), 'updated_at' => date("Y-m-d H:i:s")],
            [ 'id' => 6, 'order' => 1, 'name' => 'Компьютеры', 'slug' => 'komp-yutery', 'path' => 'komp-yutery', 'path_names' => 'Компьютеры', 'created_at' => date("Y-m-d H:i:s"), 'updated_at' => date("Y-m-d H:i:s")],
            [ 'id' => 7, 'order' => 1, 'name' => 'Товары для детей', 'slug' => 'tovary-dlya-detej', 'path' => 'tovary-dlya-detej', 'path_names' => 'Товары для детей', 'created_at' => date("Y-m-d H:i:s"), 'updated_at' => date("Y-m-d H:i:s")],
            [ 'id' => 8, 'order' => 1, 'name' => 'Строительство и ремонт', 'slug' => 'stroitel-stvo-i-remont', 'path' => 'stroitel-stvo-i-remont', 'path_names' => 'Строительство и ремонт', 'created_at' => date("Y-m-d H:i:s"), 'updated_at' => date("Y-m-d H:i:s")],
            [ 'id' => 9, 'order' => 1, 'name' => 'Авто и мото', 'slug' => 'avto-i-moto', 'path' => 'avto-i-moto', 'path_names' => 'Авто и мото', 'created_at' => date("Y-m-d H:i:s"), 'updated_at' => date("Y-m-d H:i:s")],
            [ 'id' => 10, 'order' => 1, 'name' => 'Красота и здоровье', 'slug' => 'krasota-i-zdorov-e', 'path' => 'krasota-i-zdorov-e', 'path_names' => 'Красота и здоровье', 'created_at' => date("Y-m-d H:i:s"), 'updated_at' => date("Y-m-d H:i:s")],
            [ 'id' => 11, 'order' => 1, 'name' => 'Одежда и обувь', 'slug' => 'odezhda-i-obuv', 'path' => 'odezhda-i-obuv', 'path_names' => 'Одежда и обувь', 'created_at' => date("Y-m-d H:i:s"), 'updated_at' => date("Y-m-d H:i:s")],
            [ 'id' => 12, 'order' => 1, 'name' => 'Всё для офиса', 'slug' => 'vsyo-dlya-ofisa', 'path' => 'vsyo-dlya-ofisa', 'path_names' => 'Всё для офиса', 'created_at' => date("Y-m-d H:i:s"), 'updated_at' => date("Y-m-d H:i:s")],
        ]);

        #MENU
        //Копируем изображения для меню в storage
        $oldMenuIconsPath = 'public/img/header/drop';
        $newMenuIconsPath = 'custom-menus/seeding';
        $menuIcons = [
            1 => 'washing_machine',
            2 => 'sport_tourism',
            3 => 'audio_video',
            4 => 'mobile',
            5 => 'for_home',
            6 => 'computers',
            7 => 'for_kids',
            8 => 'construction_repair',
            9 => 'auto_moto',
            10 => 'health_beauty',
            11 => 'clothes_shoes',
            12 => 'for_office'
        ];

        foreach ($menuIcons as $menuId => $menuIcon) {
            \File::copy(base_path() . '/' . $oldMenuIconsPath . '/' . $menuIcon . '.png' , base_path(). '/storage/app/public/' . $newMenuIconsPath . '/' . $menuIcon . '.png');
            $menuSeed[$menuId] = ['id' => $menuId, 'order' => $menuId, 'category_id' => $menuId, 'icon' => $newMenuIconsPath . '/' . $menuIcon . '.png', 'created_at' => date("Y-m-d H:i:s"), 'updated_at' => date("Y-m-d H:i:s")];
        }

        DB::table('custom_menus')->insert($menuSeed);


        //Создание товаров

        #PRODUCT
        $oldCardsPath = 'public/img/card';
        $newCardsPath = 'products/seeding';
        for ($i = 1; $i < 12; $i++) {
            \File::copy(base_path() . "/" . $oldCardsPath . '/card' . $i . '.png', base_path() . '/storage/app/public/' . $newCardsPath . '/card' . $i . '.png');
            $productsSeed[$i] = [
                'id' => $i,
                'name' => 'Товар с хорошими качествами и ценой ' . $i,
                'slug' => 'tovar-s-horoshimi-kachestvami-i-cenoj-' . $i,
                'image_url' => json_encode(['products/seeding/card' . $i . '.png']),
                'min_price' => 5490,
                'min_price_shop_url' => 'http://shop_url',
                'created_at' => date("Y-m-d H:i:s"),
                'updated_at' => date("Y-m-d H:i:s")
            ];
            $categoryProductSeed[$i] = ['category_id' => 1, 'product_id' => $i];
        }

        DB::table('products')->insert($productsSeed);
        DB::table('category_product')->insert($categoryProductSeed);

        //Создание магазинов
        #SHOPS
        DB::table('shops')->insert([
            [ 'id' => 1, 'name' => 'Mvideo', 'logo_img' => '', 'url' => 'http://export.admitad.com/ru/webmaster/websites/440961/products/export_adv_products/?feed_id=16616&code=c50f5dc7f8&user=coba191&template=39931'],
            [ 'id' => 2, 'name' => 'Эльдорадо', 'logo_img' => '', 'url' => 'http://export.admitad.com/ru/webmaster/websites/440961/products/export_adv_products/?feed_id=987&code=c50f5dc7f8&user=coba191&template=39932'],
            [ 'id' => 3, 'name' => 'DNS', 'logo_img' => '', 'url' => ''],
        ]);

        //Присвоение магазинов товарам
        #PRODUCT SHOPS
        DB::table('shop_product')->insert([
            [ 'id' => 1, 'shop_id' => 1, 'product_id' => 1, 'price' => 5490, 'url' => 'http://shop_url'],
            [ 'id' => 2, 'shop_id' => 1, 'product_id' => 2, 'price' => 5490, 'url' => 'http://shop_url'],
            [ 'id' => 3, 'shop_id' => 1, 'product_id' => 3, 'price' => 5490, 'url' => 'http://shop_url'],
            [ 'id' => 4, 'shop_id' => 1, 'product_id' => 4, 'price' => 5490, 'url' => 'http://shop_url'],
            [ 'id' => 5, 'shop_id' => 2, 'product_id' => 5, 'price' => 5490, 'url' => 'http://shop_url'],
            [ 'id' => 6, 'shop_id' => 2, 'product_id' => 6, 'price' => 5490, 'url' => 'http://shop_url'],
            [ 'id' => 7, 'shop_id' => 2, 'product_id' => 7, 'price' => 5490, 'url' => 'http://shop_url'],
            [ 'id' => 8, 'shop_id' => 2, 'product_id' => 8, 'price' => 5490, 'url' => 'http://shop_url'],
            [ 'id' => 9, 'shop_id' => 3, 'product_id' => 9, 'price' => 5490, 'url' => 'http://shop_url'],
            [ 'id' => 10, 'shop_id' => 3, 'product_id' => 10, 'price' => 5490, 'url' => 'http://shop_url'],
            [ 'id' => 11, 'shop_id' => 3, 'product_id' => 11, 'price' => 5490, 'url' => 'http://shop_url'],
            [ 'id' => 12, 'shop_id' => 3, 'product_id' => 12, 'price' => 5490, 'url' => 'http://shop_url'],
        ]);
    }
}
