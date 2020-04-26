<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    public $fillable = ['name', 'advantages', 'limitations', 'comment', 'experience_of_using', 'rate', 'recommended', 'product_id'];

    public function toggleFlag($flag)
    {
        $this->{$flag} = !$this->{$flag};
        return $this;
    }

    public static function boot()
    {

        parent::boot();

        static::deleted(function ($model) {
            //Кешируем данные о среднем рейтинге и кол-ве отзывов у товара
            if (Product::find($model->product_id)->exists()) {
                Product::cacheProductAvgRateAndReviewsCount($model->product_id);
            }
        });
    }


    public function getRateTitle($rateNum)
    {
        switch ($rateNum) {
            case 1:
                return "Очень плохо";
            break;
            case 2:
                return "Так себе";
            break;
            case 3:
                return "Удовлетворительно";
            break;
            case 4:
                return "Похвально";
            break;
            case 5:
                return "Отлично";
            break;
        }
    }

    public function getRateTitleAttribute()
    {
        $this->attributes['rate_title'] = $this->getRateTitle($this->rate);
        return $this->attributes['rate_title'];
    }

    public static function getAvgRate($productId) {
        return round(Review::where(['product_id' => $productId, 'approved' => 1])->avg('rate'));
    }
}
