<?php

namespace App\Console\Commands;

use App\Category;
use Illuminate\Console\Command;

class Fixtree extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fixtree:fix';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix for category urls by kalnoy plugin';

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
        echo "fix tree start\n";
        Category::fixtree();
        echo "fix tree done\n";
    }
}
