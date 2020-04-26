<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddIndexesToProductsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->index('slug');
            $table->index('min_price');
            $table->index('created_at');
            $table->index('views');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_slug_index');
            $table->dropIndex('products_min_price_index');
            $table->dropIndex('products_created_at_index');
            $table->dropIndex('products_views_index');
        });
    }
}
