<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class FilterOption extends Model
{
    public $fillable = ['name'];

    public function filterTypes(){
        $this->belongsToMany('filter_types');
    }
}
