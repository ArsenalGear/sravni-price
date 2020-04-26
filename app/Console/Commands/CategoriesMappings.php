<?php

namespace App\Console\Commands;

use App\Category;
use function GuzzleHttp\Psr7\str;
use Illuminate\Console\Command;
use Storage;
use League\Csv\Reader;
use League\Csv\CharsetConverter;
use App\CategoriesMapping;
use App\Socket\Pusher;
use Illuminate\Support\Facades\File;

class CategoriesMappings extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'parse:categories_mappings {--file_name=*} {--shop_id=*}';

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

    $message =  "Создание зависимостей категорий";
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
    if (!File::exists($filePath)) {
      $errorMessage =  "В магазине отсутствует .csv файл с соответствиями категорий";
      echo $errorMessage . "\n";
      Pusher::sendDataToServer([
        'topic_id' => 'onNewData',
        'shop_id' => $shopId,
        'type' => 'fatal',
        'message' => $errorMessage
      ]);
      return false;
    }
    $csv = Reader::createFromPath($filePath);
    CharsetConverter::addTo($csv, 'Windows-1251', 'UTF-8');
    $csv->setDelimiter(';');
    $csv->setEnclosure("'");
    $csv->setHeaderOffset(0);
    $records = $csv->getRecords();

    foreach ($records as $record) {
      $thisSiteCategory = $record["Категория на сайте"];
      $anotherSiteCategory = $record['Категория магазина'];

      if (empty($thisSiteCategory)) {
        continue;
      }
      if (empty($anotherSiteCategory)) {
        continue;
      }

      $category = Category::where('path_names', $thisSiteCategory);

      if ($category->exists()) {
        $categoryId = $category->first()->id;
        //echo "Категория " . $thisSiteCategory . " уже существует: " . $categoryId . "\n";
        $mapping = CategoriesMapping::where(['shop_id' => $shopId, 'category_id' => $categoryId, 'source_shop_url' => $anotherSiteCategory]);

        if (!$mapping->exists()) {
            $newMapping = new CategoriesMapping();
            $newMapping->shop_id = $shopId;
            $newMapping->category_id = $categoryId;
            $newMapping->source_shop_url = $anotherSiteCategory;
            $newMapping->save();
        }

      } else {
        $message = "Категория \"" . $thisSiteCategory . "\" на сайте не найдена";
        echo $message . "\n";
        continue;
      }
    }

    $message =  "Создание тестовых зависимостей категорий завершено.";
    echo $message . "\n";
    Pusher::sendDataToServer([
      'topic_id' => 'onNewData',
      'shop_id' => $shopId,
      'type' => 'info',
      'message' => $message
    ]);
  }

}
