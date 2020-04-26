<?php

use Illuminate\Database\Seeder;
use TCG\Voyager\Models\Permission;
use TCG\Voyager\Models\Role;

class PermissionRoleTableSeeder extends Seeder
{
    /**
     * Auto generated seed file.
     *
     * @return void
     */
    public function run()
    {

        #DEVELOPER
        $developerRole = Role::where('name', 'developer')->firstOrFail();
        $permissions = Permission::all();
        $developerRole->permissions()->sync(
            $permissions->pluck('id')->all()
        );

        #ADMIN
        $adminRole = Role::where('name', 'admin')->firstOrFail();
        $permissions = Permission::whereIn('key', [
            'browse_admin',

            'browse_categories',
            'read_categories',
            'edit_categories',
            'add_categories',
            'delete_categories',

            'browse_shops',
            'read_shops',
            'edit_shops',
            'add_shops',
            'delete_shops',

            'browse_vendors',
            'read_vendors',
            'edit_vendors',
            'add_vendors',
            'delete_vendors',

            'browse_products',
            'read_products',
            'edit_products',
            'add_products',
            'delete_products',

            'browse_custom_menus',
            'read_custom_menus',
            'edit_custom_menus',
            'add_custom_menus',
            'delete_custom_menus',

            'browse_filter_types',
            'read_filter_types',
            'edit_filter_types',
            'add_filter_types',
            'delete_filter_types',

            'browse_settings',
            'read_settings',
            'edit_settings',

            'browse_reviews',
            'read_reviews',
            'delete_settings',

            'browse_product_articles',
            'read_product_articles',
            'edit_product_articles',
            'add_product_articles',
            'delete_product_articles',

            'browse_product_cities',
            'read_product_cities',
            'edit_product_cities',
            'add_product_cities',
            'delete_product_cities',

            'browse_product_regions',
            'read_product_regions',
            'edit_product_regions',
            'add_product_regions',
            'delete_product_regions'

        ])->get();
        $adminRole->permissions()->sync(
            $permissions->pluck('id')->all()
        );

    }
}
