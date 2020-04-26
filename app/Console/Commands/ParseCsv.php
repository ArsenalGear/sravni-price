<?php

namespace App\Console\Commands;

use App\FilterType;
use App\Product;
use App\Shop;
use App\Socket\Pusher;
use App\Vendor;
use GuzzleHttp\Psr7\str;
use Illuminate\Console\Command;
use League\Csv\Reader;
use Storage;
use Carbon\Carbon;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use App\CategoriesMapping;

class ParseCsv extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'parse:csv {--shop_id=*} {--sales=*}'; //команда для старта работы парсера
    protected $csvParserLogger; //объект логгера laravel
    protected $logFileName = 'csv_parser'; //Название файла с логами
    protected $errorsCount = 0; //количество ошибок при парсинге файла
    protected $dontParseFilterTypes = ['Особенности', 'Код', 'Дополнительно']; //пропускать типы фильтра с этими названиями
    protected $requiredCsvHeadersList = ['NAME', 'CATEGORY', 'PRICE', 'PICTURE', 'VENDOR', 'URL']; //Обязательные поля в csv
    protected $requiredSalesCsvHeadersList = ['NAME', 'CATEGORY', 'PRICE', 'OLDPRICE', 'PICTURE', 'VENDOR', 'URL']; //Обязательные поля в csv со скидками
    protected $sales; //Файл распознаётся как файл без скидок, если нет опции --sales=true (значение присваивается в начале парсинга)
    //некоторые ф-ии для отладки
    protected $debug = [
        //изображения не скачиваются, в базу пишутся оригинальные ссылки
        'images_only_hrefs' => true,
        //таблица соответствий категорий заполняется рандомно, раскидывая их по первым 12 категориям
        'test_categories_mapping' => false,
        //парсить только n первых товара
        'only_n_products' => false,
        'count_of_parsed_products' => 100,
        //не загружать csv файл, а использовать заранее скаченный
        'fake_csv' => false,
        'fake_csv_name' => '1563362324_temp.csv',
        'logs' => false //включить/выключить логирование
    ];


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
        $this->csvParserLogger = new Logger('csvparser');

        //Определяем, парсим файл со скидками или без по наличию опции --sales=true
        if (isset($this->option('sales')[0]) && !empty($this->option('sales')[0]) && json_decode($this->option('sales')[0])) {
            $this->sales = true;
        } else {
            $this->sales = false;
        }

        //Проверяем, указан ли магазин, для которого парсим
        $shopId = $this->option('shop_id');
        if (isset($shopId[0]) && !empty($shopId[0])) {
            $shopId = intval($shopId[0]);
        } else {
            $errorMessage = "Укажите id магазина в опции --shop_id";
            echo $errorMessage . "\n";
            if ($this->sales) {
                Pusher::sendDataToServer([
                    'topic_id' => 'onNewData',
                    'shop_id' => $shopId,
                    'type' => 'fatal-sales',
                    'message' => $errorMessage
                ]);
            } else {
                Pusher::sendDataToServer([
                    'topic_id' => 'onNewData',
                    'shop_id' => $shopId,
                    'type' => 'fatal',
                    'message' => $errorMessage
                ]);
            }

            return false;
        }

        $shop = Shop::find($shopId);
        if (!empty($shop)) {
            if ($this->sales) {
                //Адрес файла со скидками
                $url = $shop->sales_url;
            } else {
                $url = $shop->url;
            }

            if (empty($url)) {
                $errorMessage = "У магазина " . $shopId . ": \"" . $shop->name . "\" отсутствует ссылка на .csv файл.\n";
                $errorMessagePush = "Нет ссылки на .csv файл.";
                if ($this->sales) {
                    Pusher::sendDataToServer([
                        'topic_id' => 'onNewData',
                        'shop_id' => $shopId,
                        'type' => 'fatal-sales',
                        'message' => $errorMessagePush
                    ]);
                } else {
                    Pusher::sendDataToServer([
                        'topic_id' => 'onNewData',
                        'shop_id' => $shopId,
                        'type' => 'fatal',
                        'message' => $errorMessagePush
                    ]);
                }

                $this->parserLog($errorMessage);
                return false;
            }
            //Создание соответствий для категорий
            $csv = $shop->categories_mappings_file;
            if (empty($csv)) {
                $errorMessage = "У магазина " . $shopId . ": \"" . $shop->name . "\" отсутствует .csv файл соответствия категорий.\n";
                $errorMessagePush = "Нет ссылки на .csv файл.";
                if ($this->sales) {
                    Pusher::sendDataToServer([
                        'topic_id' => 'onNewData',
                        'shop_id' => $shopId,
                        'type' => 'fatal-sales',
                        'message' => $errorMessagePush
                    ]);
                } else {
                    Pusher::sendDataToServer([
                        'topic_id' => 'onNewData',
                        'shop_id' => $shopId,
                        'type' => 'fatal',
                        'message' => $errorMessagePush
                    ]);
                }

                $this->parserLog($errorMessage);
                return false;
            } else {
                if (!empty(json_decode($csv))) {
                    $categoriesMappingCsvPath = json_decode($csv)[0]->download_link;
                } else {
                    if (!$this->debug['test_categories_mapping']) {
                        $errorMessage = "У магазина " . $shopId . ": \"" . $shop->name . "\" отсутствует .csv файл соответствия категорий.\n";
                        $errorMessagePush = "Нет ссылки на .csv файл.";
                        if ($this->sales) {
                            Pusher::sendDataToServer([
                                'topic_id' => 'onNewData',
                                'shop_id' => $shopId,
                                'type' => 'fatal-sales',
                                'message' => $errorMessagePush
                            ]);
                        } else {
                            Pusher::sendDataToServer([
                                'topic_id' => 'onNewData',
                                'shop_id' => $shopId,
                                'type' => 'fatal',
                                'message' => $errorMessagePush
                            ]);
                        }

                        $this->parserLog($errorMessage);
                        return false;
                    }

                }
            }
        } else {
            $errorMessage = "Магазин с shop_id = " . $shopId . " не найден в базе данных.\n";
            $errorMessagePush = "Магазин не найден в базе данных.\n";
            Pusher::sendDataToServer([
                'topic_id' => 'onNewData',
                'shop_id' => $shopId,
                'type' => 'fatal',
                'message' => $errorMessagePush
            ]);
            $this->parserLog($errorMessage);
            return false;
        }


        $message = "Скачивание файла " . $url . "...";
        $messagePush = "Скачивание файла...";
        echo $message . "\n";
        Pusher::sendDataToServer([
            'topic_id' => 'onNewData',
            'shop_id' => $shopId,
            'type' => 'info',
            'message' => $messagePush
        ]);
        //Предварительное скачивание csv файла
        try {
            if ($this->debug['fake_csv']) {
                $tempCsv['name'] = $this->debug['fake_csv_name'];
                $tempCsv['path'] = Storage::path($this->debug['fake_csv_name']);
            } else {
                $tempCsv = $this->downloadCsv($url);
            }

            $csv = $this->parseCsv($tempCsv['path'], $shopId);

        } catch (\Exception $ex) {
            $errorMessage = "Ошибка скачивания/чтения файла " . $url . ": " . $ex->getMessage() . "\n";
            $errorMessagePush = "Ошибка скачивания/чтения файла";
            Pusher::sendDataToServer([
                'topic_id' => 'onNewData',
                'shop_id' => $shopId,
                'type' => 'fatal',
                'message' => $errorMessagePush
            ]);
            $this->parserLog($errorMessage);

            //Удаляем временный файл
            if (!empty($tempCsv)) {
                if(isset($tempCsv['path']) && !empty($tempCsv['path'])) {
                    if(\File::exists(public_path($tempCsv['path']))) {
                        Storage::delete($tempCsv['name']);
                    }
                }
            }

            return false;
        }

        $message =  "Скачивание файла: готово (" . $tempCsv['name'] . ")";
        $messagePush =  "Скачивание файла: готово";
        echo $message . "\n";
        Pusher::sendDataToServer([
            'topic_id' => 'onNewData',
            'shop_id' => $shopId,
            'type' => 'info',
            'message' => $messagePush
        ]);

        //Парсинг соответствий категорий из файла
        if ($this->debug['test_categories_mapping']) {
            \Artisan::call('test:categories_mappings', [
                '--file_name' => [$tempCsv['name']],
                '--shop_id' => [$shopId]
            ]);
        } else {
            \Artisan::call('parse:categories_mappings', [
                '--file_name' => [
                    '/public/' . $categoriesMappingCsvPath],
                '--shop_id' => [$shopId]
            ]);
        }

        //Анализ количества строк в процентах
        try {
            $countOfRows = 0;
            $message = "Анализ файла...";
            echo $message . "\n";
            Pusher::sendDataToServer([
                'topic_id' => 'onNewData',
                'shop_id' => $shopId,
                'type' => 'info',
                'message' => $message
            ]);
            foreach ($csv as $i) {
                $countOfRows++;
            }
            //$countOfRows = 100%; 1% = 100/$countOfRows
            $onePercent = 100 / $countOfRows;

        } catch (\Exception $ex) {
            $errorMessage = "Невозможно проанализировать файл " . $tempCsv['name']. ": " . $ex->getMessage() . "\n";
            $errorMessagePush = "Невозможно проанализировать файл";
            if ($this->sales) {
                Pusher::sendDataToServer([
                    'topic_id' => 'onNewData',
                    'shop_id' => $shopId,
                    'type' => 'fatal-sales',
                    'message' => $errorMessagePush
                ]);
            } else {
                Pusher::sendDataToServer([
                    'topic_id' => 'onNewData',
                    'shop_id' => $shopId,
                    'type' => 'fatal',
                    'message' => $errorMessagePush
                ]);
            }

            $this->parserLog($errorMessage);
            Storage::delete($tempCsv['name']);
            return false;
        }

        $message = "Анализ файла: готово.";
        echo $message . "\n";
        Pusher::sendDataToServer([
            'topic_id' => 'onNewData',
            'shop_id' => $shopId,
            'type' => 'info',
            'message' => $message
        ]);

        $message = "Идёт загрузка товаров в базу данных.";
        echo $message . "\n\n";
        Pusher::sendDataToServer([
            'topic_id' => 'onNewData',
            'shop_id' => $shopId,
            'type' => 'info',
            'message' => $message
        ]);

        //Загрузка товаров в БД
        foreach ($csv as $i => $record) {
            if($this->debug['only_n_products'] && ($i > $this->debug['count_of_parsed_products'])) {
                $message = 'Парсинг завершён.';
                if ($this->errorsCount > 0) {
                    $message = $message . "Ошибок " . $this->errorsCount;
                }

                echo "\n" . $message . "\n";
                if ($this->sales) {
                    Pusher::sendDataToServer([
                        'topic_id' => 'onNewData',
                        'shop_id' => $shopId,
                        'type' => 'finish-sales',
                        'message' => $message
                    ]);
                } else {
                    Pusher::sendDataToServer([
                        'topic_id' => 'onNewData',
                        'shop_id' => $shopId,
                        'type' => 'finish',
                        'message' => $message
                    ]);
                }

                return false;
            }

            if ($this->debug['only_n_products']) {
                $onePercent = 100 / $this->debug['count_of_parsed_products'];
            }

            $percents =  ceil($onePercent * $i);
            echo "\n" . $percents . "%\n";

            Pusher::sendDataToServer([
                'topic_id' => 'onNewData',
                'shop_id' => $shopId,
                'type' => 'persents',
                'message' => $percents
            ]);

            print_r($record) . "\n";

            //Проверяем, есть ли соответствие в магазине для данной категории
            $categoriesMapping = CategoriesMapping::where('source_shop_url', $record['CATEGORY']);
            if ($categoriesMapping->exists()) {
                //Категория найдена
                $categoryId = $categoriesMapping->first()->category_id;
            } else {
                //Данный товар не будет записан в базу данных, пропускаем
                $errorMessage = 'Для категории ' . $record['CATEGORY'] . ' не обнаружено соответствие в магазине';
                $errorMessagePush = 'Нет соответствия для ' . $record['CATEGORY'];
                if ($this->sales) {
                    Pusher::sendDataToServer([
                        'topic_id' => 'onNewData',
                        'shop_id' => $shopId,
                        'type' => 'error-sales',
                        'message' => $errorMessagePush
                    ]);
                } else {
                    Pusher::sendDataToServer([
                        'topic_id' => 'onNewData',
                        'shop_id' => $shopId,
                        'type' => 'error',
                        'message' => $errorMessagePush
                    ]);
                }

                $this->parserLog($errorMessage);
                continue;
            }

            //Проверяем, существует ли этот товар
            //Если да - добавляем магазин с новой ценой, если его ещё нет. Добавляем изображение в товар.
            //Иначе создаём новый магазин
            //Изображения сравниваем побайтово

            //Название товара может быть сгенерировано по шаблону
            if (!empty($shop->product_name_template)) {
                $productName = str_replace('[NAME]', $record['NAME'], $shop->product_name_template);
                if (stripos($productName,'[MODEL]') !== FALSE) {
                    $productName = str_replace('[MODEL]', $record['MODEL'], $productName);
                }
            } else {
                $productName = $record['NAME'];
            }

            $product = Product::where('name', $productName);

            if (!$product->exists()) {
                //Товар ещё не существует
                $product = new Product();
                $product->name = $productName;
                if ($this->sales) {
                    //у товаров со скидкой есть дополнительное поле со старой ценой
                    $product->old_price = $record['OLDPRICE'];
                }

                if (isset($record['DESCRIPTION']) && !empty($record['DESCRIPTION'])) {
                    $product->description = $record['DESCRIPTION'];
                }
                $product->slug = str_slug($productName);
                Pusher::sendDataToServer([
                    'topic_id' => 'onNewData',
                    'shop_id' => $shopId,
                    'type' => 'info',
                    'message' => mb_strimwidth($product->name, 0,50, '...')
                ]);

                //Сохранить изображение в storage
                $extention = $this->getExtension($record['PICTURE']);
                $newImageName = 'public/products/' . md5(microtime() . rand(0, 9999)) . "." . $extention;

                //Попытка скачивания изображения
                try {
                    if ($this->debug['images_only_hrefs']) {
                        $product->image_url = json_encode([$record['PICTURE']]);
                    } else {
                        $file = $this->grab_image($record['PICTURE']);
                        Storage::put($newImageName, $file);
                        chmod(Storage::path($newImageName), 0777);
                        $fullPathPath = base_path() . '/storage/app/public/';
                        $relativeImgPath = str_replace($fullPathPath, "", Storage::path($newImageName));
                        $product->image_url = json_encode(['/storage/' . $relativeImgPath]);
                    }

                } catch (\Exeption $ex) {
                    $errorMessage = "Изображение " . $record['PICTURE'] . " не получено: " . $ex->getMessage() . "\n";
                    $errorMessagePush = "Изображение " . $record['PICTURE'] . " не получено.";
                    //Возможно, ошибка из-за высокой частоты запросов, ждём
                    if ($this->sales) {
                        Pusher::sendDataToServer([
                            'topic_id' => 'onNewData',
                            'shop_id' => $shopId,
                            'type' => 'error-sales',
                            'message' => $errorMessagePush
                        ]);
                    } else {
                        Pusher::sendDataToServer([
                            'topic_id' => 'onNewData',
                            'shop_id' => $shopId,
                            'type' => 'error',
                            'message' => $errorMessagePush
                        ]);
                    }

                    $this->parserLog($errorMessage);

                    sleep(5);
                }

            } else {
                $message = "Товар \"" . $productName . "\" уже существует";
                echo $message . "\n";
                /*Pusher::sendDataToServer([
                    'topic_id' => 'onNewData',
                    'shop_id' => $shopId,
                    'type' => 'info',
                    'message' => $message
                ]);*/
                $product = $product->first();
            }


            //Создаём Vendor, если такого ещё нет
            //Если уже существует, получаем id
            $vendor = Vendor::where('name', $record['VENDOR']);
            if ($vendor->exists()) {
                $message = "Бренд \"" . $record['VENDOR'] . "\" уже существует";
                echo "\n" . $message . "\n";
                /*Pusher::sendDataToServer([
                    'topic_id' => 'onNewData',
                    'shop_id' => $shopId,
                    'type' => 'info',
                    'message' => $message
                ]);*/
                $vendorId = $vendor->first()->id;
            } else {
                $vendor = new Vendor();
                $vendor->name = $record['VENDOR'];
                $vendor->save();
                $vendorId = $vendor->id;
            }

            $product->vendor_id = $vendorId;
            $product->save();

            //Добавление опций товара
            $harsArray = [];
            //Если столбец с характеристиками присутствует, добавляем фильтры и их опции
            if (isset($record['HAR']) && !empty($record['HAR'])) {
                $devider = $this->findDevider($record['HAR']);
                if (!$devider) {
                    $harsArray[] = $record['HAR'];
                } else {
                    $harsArray = explode($devider, $record['HAR']);
                }

                echo "\nРазделитель: \"" . $devider, "\"";
                if (isset($devider) && !empty($devider)) {
                    foreach ($harsArray as $har) {
                        $optionsArr = explode(':', $har);
                        if (
                            count($optionsArr) > 1
                            &&
                            (
                                isset($optionsArr[0])
                                ||
                                isset($optionsArr[1])
                            )
                        ) {
                            $filterTypeName = mb_strimwidth(trim($optionsArr[0]), 0, 120);
                            $filterOptionName = mb_strimwidth(trim($optionsArr[1]), 0, 120);
                            echo "\nтип и опция: " . $filterTypeName . ": " . $filterOptionName;

                            //пропустить указанные в настройках парсера типы
                            if (
                            in_array($filterTypeName, $this->dontParseFilterTypes)
                            ) {
                                continue;
                            }

                            //создаём тип фильтра (если ещё нет), добавляем опцию (если ещё нет), добавляем связку к товару
                            FilterType::addFilterTypeFilterOption($filterTypeName, $filterOptionName, $product->id);
                        } else {
                            continue;
                        }
                    }
                }
            }

            //Магазины добавляем после создания товара, т.к. нужен его id
            if ($this->sales) {
                //У товара со скидкой может быть только один магазин, удаляем все магазины товара
                $product->shops()->detach();
                //кешируем процент скидки
                $product->sale_persent = Product::calculateSalePercent($record['PRICE'], $product->old_price);
            } else {
                //Проверяем, существует ли такой магазин у товара, и если есть, удаляем (т.к его нужно заменить)
                if ($product->shops()->where(['product_id' => $product->id, 'shop_id' => $shopId])->exists()) {
                    $product->shops()->detach(['product_id' => $product->id, 'shop_id' => $shopId]);
                }
            }

            //Добавляем магазин
            $product->shops()->attach($product, ['shop_id' => $shopId, 'price' => $record['PRICE'], 'url' => $record['URL']]);

            //Если товар не принадлежит категории categoryId, добавляем
            if (!$product->category()->where(['product_id' => $product->id, 'category_id' => $categoryId])->exists()) {
                $product->category()->attach($product, ['category_id' => $categoryId]);
            }

            //также нужно вычислить минимальную цену и id соответствующего ей магазина
            $minPriceAndShop = Product::find($product->id)->shops()->where('price',
                Product::find($product->id)->shops()->min('price')
            )->first();

            $product->shops_count = $product->shops()->count();

            $product->min_price = $minPriceAndShop->pivot->price;
            $product->min_price_shop_url = $minPriceAndShop->pivot->url;
            $product->save();
            sleep(.1);
        }

        echo "\n100%";
        Pusher::sendDataToServer([
            'topic_id' => 'onNewData',
            'shop_id' => $shopId,
            'type' => 'percents',
            'message' => 100
        ]);
        sleep(3);

        $message = 'Парсинг завершён.';
        /*if ($this->errorsCount > 0) {
            $message = $message . "Ошибок " . $this->errorsCount;
        }*/
        echo "\n" . $message . "\n";
        if ($this->sales) {
            Pusher::sendDataToServer([
                'topic_id' => 'onNewData',
                'shop_id' => $shopId,
                'type' => 'finish-sales',
                'message' => $message
            ]);
        } else {
            Pusher::sendDataToServer([
                'topic_id' => 'onNewData',
                'shop_id' => $shopId,
                'type' => 'finish',
                'message' => $message
            ]);
        }


        //Удаляем временный файл
        Storage::delete($tempCsv['name']);
    }

    //Заргузка csv файла
    public function downloadCsv($url)
    {
        $contents = $this->file_get_contents_utf8($url);
        $name = Carbon::now()->timestamp . '_' . 'temp.csv';
        Storage::put($name, $contents);
        $savedCsvPath = Storage::path($name);
        chmod($savedCsvPath, 0777);
        return ['path' => $savedCsvPath, 'name' => $name];
    }

    function file_get_contents_utf8($fn) {
        $content = file_get_contents($fn);
        return mb_convert_encoding($content, 'UTF-8',
            'Windows-1251');
    }
    //Просмотр csv файла
    public function parseCsv($filePath, $shopId)
    {
        $csv = Reader::createFromPath($filePath);
        $headers = $csv->fetchOne();
        if (isset($headers) && !empty($headers)) {
            $headersArr = explode(';', $headers[0]);
            if ($this->sales) {
                foreach ($this->requiredSalesCsvHeadersList as $requiredHeader) {
                    if (!in_array($requiredHeader, $headersArr)) {
                        $errorMessagePush = "В csv файле товаров со скидками отсутствует обязательный столбец " . $requiredHeader;
                        Pusher::sendDataToServer([
                            'topic_id' => 'onNewData',
                            'shop_id' => $shopId,
                            'type' => 'fatal-sales',
                            'message' => $errorMessagePush
                        ]);

                        $this->parserLog($errorMessagePush);

                        return false;
                    }
                }
            } else {
                foreach ($this->requiredCsvHeadersList as $requiredHeader) {
                    if (!in_array($requiredHeader, $headersArr)) {
                        $errorMessagePush = "В csv файле отсутствует обязательный столбец " . $requiredHeader;
                        Pusher::sendDataToServer([
                            'topic_id' => 'onNewData',
                            'shop_id' => $shopId,
                            'type' => 'fatal',
                            'message' => $errorMessagePush
                        ]);

                        $this->parserLog($errorMessagePush);

                        return false;
                    }
                }
            }

        }
        //CharsetConverter::addTo($csv, 'Windows-1251', 'UTF-8');
        $csv->setDelimiter(';');
        $csv->setHeaderOffset(0);
        $records = $csv->getRecords();
        return $records;
    }

    //Получить расширение файла из строки
    public function getExtension($fileName) {
        $exploded = explode(".", $fileName);
        $extension = $exploded[count($exploded)-1];
        return $extension ? $extension : false;
    }

    //Логирование
    public function parserLog($errorMessage) {
        echo $errorMessage . "\n";
        if ($this->debug['logs']) {
            $logFileName = 'logs/' . $this->logFileName . "-" . Carbon::now()->format('Y-m-d') . ".log";
            $this->csvParserLogger->pushHandler(new StreamHandler(storage_path($logFileName)), Logger::ERROR);
            $this->csvParserLogger->error('CsvParserLog', [$errorMessage]);
            $this->errorsCount++;
        }
    }

    function grab_image($url){
        $ch = curl_init ($url);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_BINARYTRANSFER,1);
        $raw=curl_exec($ch);
        curl_close ($ch);
        return $raw;
    }

    //Определение типа разделителя в опциях
    public function findDevider($string) {
        if (stripos($string,'|')) {
            $devider = "|";
        } else if (stripos($string, ';')) {
            $devider = ";";
        } else if (stripos($string, ',')) {
            $devider = ",";
        } else {
            $devider = false;
        }
        return $devider;
    }
}
