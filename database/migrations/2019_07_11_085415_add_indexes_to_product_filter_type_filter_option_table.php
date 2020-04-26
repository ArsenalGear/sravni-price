<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddIndexesToProductFilterTypeFilterOptionTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('product_filter_type_filter_option', function (Blueprint $table) {
            $table->bigInteger('product_id')->unsigned()->change();
            $table->bigInteger('filter_type_id')->unsigned()->change();
            $table->bigInteger('filter_option_id')->unsigned()->change();

            $table->foreign('product_id')->references('id')->on('products');
            $table->foreign('filter_option_id')->references('id')->on('filter_options');
            $table->foreign('filter_type_id')->references('id')->on('filter_types');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('product_filter_type_filter_option', function (Blueprint $table) {
            $table->dropForeign('product_filter_type_filter_option_product_id_foreign');
            $table->dropForeign('product_filter_type_filter_option_filter_type_id_foreign');
            $table->dropForeign('product_filter_type_filter_option_filter_option_id_foreign');
            /*$table->integer('product_id')->change();
            $table->integer('filter_type_id')->change();
            $table->integer('filter_option_id')->change();*/
        });
    }
}
