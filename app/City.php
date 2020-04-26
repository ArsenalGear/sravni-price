<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    public function region()
    {
        return $this->belongsToMany('App\Region');
    }

    public static function getCityNameFromSlug($slug)
    {
        $city = City::where('slug', $slug);
        if ($city->exists()) {
           return $city->first();
        } else {
            $city = new City();
            $city->name_first_form = 'Москва';
            $city->name_second_form = 'Москве';
            return $city;
        }

    }
}
