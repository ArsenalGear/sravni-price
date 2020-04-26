<?php
/**
 * Created by PhpStorm.
 * User: dmitry
 * Date: 20.05.19
 * Time: 13:55
 */
namespace App;

use Illuminate\Http\Request;

Class PriceFormat
{
    static function numberFormatWithSpaces($price , $decimals = 0)
    {
        $newPrice = number_format($price, $decimals, ',', ' ');
        return $newPrice;
    }
}
