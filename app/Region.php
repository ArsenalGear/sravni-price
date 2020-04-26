<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    public function city()
    {
        return $this->hasMany('App\City');
    }
}
