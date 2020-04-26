<?php

use Illuminate\Database\Seeder;
use TCG\Voyager\Models\Permission;

class PermissionsTableSeeder extends Seeder
{
    /**
     * Auto generated seed file.
     */
    public function run()
    {
        $keys = [
            'browse_admin',
            'browse_bread',
            'browse_database',
            'browse_media',
            'browse_compass',
        ];

        foreach ($keys as $key) {
            Permission::firstOrCreate([
                'key'        => $key,
                'table_name' => null,
            ]);
        }

        Permission::generateFor('menus');

        Permission::generateFor('roles');

        Permission::generateFor('users');

        Permission::generateFor('settings');

        Permission::generateFor('categories');

        Permission::generateFor('shops');

        Permission::generateFor('vendors');

        Permission::generateFor('products');

        Permission::generateFor('custom_menus');

        Permission::generateFor('filter_types');

        Permission::generateFor('reviews');

        Permission::generateFor('product_articles');

        Permission::generateFor('regions');

        Permission::generateFor('cities');
    }
}
