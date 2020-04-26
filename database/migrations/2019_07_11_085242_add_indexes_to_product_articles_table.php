<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddIndexesToProductArticlesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('product_articles', function (Blueprint $table) {
            $table->index('slug');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('product_articles', function (Blueprint $table) {
            $table->dropIndex('product_articles_slug_index');
            $table->dropIndex('product_articles_created_at_index');
        });
    }
}
