<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddIndexesToCategoriesMappingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('categories_mappings', function (Blueprint $table) {
            $table->bigInteger('shop_id')->unsigned()->change();
            $table->integer('category_id')->unsigned()->change();
            $table->foreign('category_id')->references('id')->on('categories');
            $table->foreign('shop_id')->references('id')->on('shops');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('categories_mappings', function (Blueprint $table) {
            $table->dropForeign('categories_mappings_category_id_foreign');
            $table->dropForeign('categories_mappings_shop_id_foreign');
            /*$table->integer('shop_id')->change();
            $table->integer('category_id')->change();*/
        });
    }
}
