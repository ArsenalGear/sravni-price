<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeFieldsInShopProductTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('shop_product', function (Blueprint $table) {
            $table->bigInteger('shop_id')->unsigned()->change();
            $table->bigInteger('product_id')->unsigned()->change();
            $table->string('url', 800)->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('shop_product', function (Blueprint $table) {
            $table->integer('shop_id')->change();
            $table->bigInteger('product_id')->change();
            $table->longText('url')->change();
        });
    }
}
