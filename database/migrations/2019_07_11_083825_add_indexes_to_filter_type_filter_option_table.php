<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddIndexesToFilterTypeFilterOptionTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('filter_type_filter_option', function (Blueprint $table) {
            $table->bigInteger('filter_type_id')->unsigned()->change();
            $table->bigInteger('filter_option_id')->unsigned()->change();
            $table->foreign('filter_type_id')->references('id')->on('filter_types');
            $table->foreign('filter_option_id')->references('id')->on('filter_options');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('filter_type_filter_option', function (Blueprint $table) {
            $table->dropForeign('filter_type_filter_option_filter_type_id_foreign');
            $table->dropForeign('filter_type_filter_option_filter_option_id_foreign');
           /* $table->integer('filter_type_id')->change();
            $table->integer('filter_option_id')->change();*/
        });
    }
}
