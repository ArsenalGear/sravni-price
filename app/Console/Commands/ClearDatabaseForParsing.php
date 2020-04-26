<?php

namespace App\Console\Commands;

use App\CategoriesMapping;
use App\FilterOption;
use App\FilterType;
use App\Product;
use App\Shop;
use App\Vendor;
use Illuminate\Console\Command;
use Illuminate\Queue\Jobs\Job;
use Illuminate\Support\Facades\DB;

class ClearDatabaseForParsing extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'parse:cleardb {--without_mapping_clear=false}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        echo "start truncate...\n";
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        $option = $this->option('without_mapping_clear');
        if ($option == "false") {
            CategoriesMapping::truncate();
        }

        Product::truncate();
        FilterType::truncate();
        FilterOption::truncate();
        Vendor::truncate();
        DB::table('filter_type_filter_option')->truncate();
        DB::table('product_filter_type_filter_option')->truncate();
        DB::table('category_product')->truncate();
        DB::table('shop_product')->truncate();
        DB::table('jobs')->truncate();
        echo "end truncate.\n";
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

    }
}
