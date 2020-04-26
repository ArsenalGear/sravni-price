<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ChangeFieldsInShopsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('shops', function (Blueprint $table) {
            $table->string('url', 800)->change();
            $table->string('categories_mappings_file', 800)->change();
            $table->string('sales_url', 800)->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('shops', function (Blueprint $table) {
            $table->longText('url')->change();
            $table->longText('categories_mappings_file')->change();
            $table->longText('sales_url')->change();
        });
    }
}
