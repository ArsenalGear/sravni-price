<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Region;
use App\City;

class CitiesController extends Controller
{
    public function getRegions()
    {
        return Region::select('id', 'name')->get();
    }

    public function getCitiesByRegionId($regionId)
    {
        return City::where('region_id', $regionId)->get();
    }
}
