<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateProductArticlesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('product_articles', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->longText('slug');
            $table->longText('preview_description');
            $table->longText('preview_image');
            $table->longText('content');
            $table->longText('video')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('product_articles');
    }
}
