<?php

namespace App\Http\Controllers;

use App\Jobs\ParseCsv;
use App\Jobs\ParseSalesCsv;

class CsvImportController extends Controller
{
    public function addCsvToQueue($shop_id)
    {
        ParseCsv::dispatch($shop_id);
    }

    public function addSalesCsvToQueue($shop_id)
    {
        ParseSalesCsv::dispatch($shop_id);
    }
}
