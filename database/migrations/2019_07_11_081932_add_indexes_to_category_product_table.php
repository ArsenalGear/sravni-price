<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddIndexesToCategoryProductTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('category_product', function (Blueprint $table) {
            $table->integer('category_id')->unsigned()->change();
            $table->bigInteger('product_id')->unsigned()->change();
            $table->foreign('category_id')->references('id')->on('categories');
            $table->foreign('product_id')->references('id')->on('products');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('category_product', function (Blueprint $table) {
            $table->dropForeign('category_product_category_id_foreign');
            $table->dropForeign('category_product_product_id_foreign');
            /*$table->integer('category_id')->change();
            $table->integer('product_id')->change();*/
        });
    }
}
