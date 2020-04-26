<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Storage;
use League\Csv\Reader;
use League\Csv\CharsetConverter;
use App\CategoriesMapping;
use App\Socket\Pusher;

class TestCategoriesMappings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:categories_mappings {--file_name=*} {--shop_id=*}';

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

        $shopId = $this->option('shop_id');
        if (isset($shopId[0]) && !empty($shopId[0])) {
            $shopId = intval($shopId[0]);
        } else {
            $errorMessage = "Укажите id магазина в опции --shop_id";
            echo $errorMessage . "\n";
            Pusher::sendDataToServer([
                'topic_id' => 'onNewData',
                'shop_id' => "empty",
                'type' => 'error',
                'message' => $errorMessage
            ]);
            return false;
        }

        $message =  "Создание тестовых зависимостей категорий";
        echo $message . "\n";
        Pusher::sendDataToServer([
            'topic_id' => 'onNewData',
            'shop_id' => $shopId,
            'type' => 'info',
            'message' => $message
        ]);

        $fileName = $this->option('file_name');
        if (isset($fileName[0]) && !empty($fileName[0])) {
            $fileName = $fileName[0];
        } else {
            $errorMessage =  "Укажите название .csv файла в опции --file_name";
            echo $errorMessage . "\n";
            Pusher::sendDataToServer([
                'topic_id' => 'onNewData',
                'shop_id' => $shopId,
                'type' => 'error',
                'message' => $errorMessage
            ]);
            return false;
        }

        $filePath = Storage::path($fileName);
        $csv = Reader::createFromPath($filePath);
        //CharsetConverter::addTo($csv, 'Windows-1251', 'UTF-8');
        $csv->setDelimiter(';');
        $csv->setHeaderOffset(0);
        $records = $csv->getRecords();

        foreach ($records as $record) {
            $categories[] = $record['CATEGORY'];
        }

        $categories = array_unique($categories);

        $i = 1;
        $j = 1;
        $categoriesCount = count($categories);

        foreach ($categories as $categoryName) {
            if ($i == 12) {
                $i = 1;
            } else {
                $i++;
            }

            $categoriesMapping = new CategoriesMapping();
            $categoriesMapping->category_id = $i;
            $categoriesMapping->source_shop_url = $categoryName;
            $categoriesMapping->save();
            sleep(.1);
            $message = $j . " категорий из " . $categoriesCount ;
            echo $message . "\n";
            Pusher::sendDataToServer([
                'topic_id' => 'onNewData',
                'shop_id' => $shopId,
                'type' => 'info',
                'message' => $message
            ]);
            $j++;
        }


        $message =  "Создание тестовых зависимостей категорий завершено.\n";
        echo $message . "\n";
        Pusher::sendDataToServer([
            'topic_id' => 'onNewData',
            'shop_id' => $shopId,
            'type' => 'info',
            'message' => $message
        ]);
    }
}
