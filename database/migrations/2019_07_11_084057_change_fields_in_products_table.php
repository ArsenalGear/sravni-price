<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeFieldsInProductsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('name', 500)->change();
            $table->string('slug', 500)->change();
            $table->bigInteger('vendor_id')->unsigned()->change();
            $table->foreign('vendor_id')->references('id')->on('vendors');
            $table->string('min_price_shop_url', 800)->change();
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
            $table->longText('name')->change();
            $table->longText('slug')->change();
            $table->dropForeign('products_vendor_id_foreign');
            //$table->integer('vendor_id')->change();
            $table->longText('min_price_shop_url')->change();
        });
    }
}
