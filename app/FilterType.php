<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\FilterOption;

class FilterType extends Model
{
    public function filterOptions()
    {
        return $this->belongsToMany('App\FilterOption', 'filter_type_filter_option');
    }

    public static function boot()
    {

        parent::boot();

        //При создании товара сохраняем его связи с магазинами.
        static::created(function ($filterType) {
            $options = \request('type-filter-options-add-delete');
            if (!empty($options)) {
                $options = json_decode($options);
            }

            if (isset($options->add)) {
              foreach ($options->add as $filterOptionName) {
                $filterOption = FilterOption::where('name', $filterOptionName);
                if (!$filterOption->exists()) {
                  $filterOption = new FilterOption();
                  $filterOption->name = $filterOptionName;
                  $filterOption->slug = str_slug($filterOptionName);
                  $filterOption->save();
                } else {
                  $filterOption = $filterOption->first();
                }
                $filterType->filterOptions()->attach($filterOption->id);
              }
            }

        });
    }

    static function checkOptionExistance($filterTypeId, $optionId, $optionName)
    {
        $type = \request('type');

        switch ($type) {
            case 'products':
                if (!empty($optionId)) {
                    $exists = Category::find($filterTypeId)->products()->where('product_id', $optionId)->exists();
                } elseif (!empty($optionName)) {
                    $exists = Category::find($filterTypeId)->products()->where('name', $optionName)->exists();
                } else {
                    $exists = false;
                }
            break;
            case 'options':
                if (!empty($optionId)) {
                    $exists = FilterType::find($filterTypeId)->filterOptions()->where('filter_option_id', $optionId)->exists();
                } elseif (!empty($optionName)) {
                    $exists = FilterType::find($filterTypeId)->filterOptions()->where('name', $optionName)->exists();
                } else {
                    $exists = false;
                }
            break;

        }

        return ['exists' => $exists];
    }

    //Для админ-панели
    static function getFilterOptions($filterTypeId)
    {
        $filterType = FilterType::find($filterTypeId);

        return [
            'success' => 1,
            'items' => $filterType->filterOptions()
                ->offset(\request('offset'))
                ->limit(10)
                ->get()
        ];
    }

    static function addFilterTypeFilterOption($filterTypeName, $filterOptionName, $productId=false)
    {
        /*
         * проверяем, существует ли тип фильтра с таким названием (Вертикальная нагрузка на шар)
                если да
                    проверяем, существует ли опция с таким названием (До 75 кг)
                        если да
                            создаём отношение filter_type_filter_option
                            добавляем тип и опцию в товар (product_filter_type_filter_option)
                        иначе
                            создаём опцию
                            создаём отношение filter_type_filter_option
                            добавляем тип и опцию в товар (product_filter_type_filter_option)
                иначе
                    создаём тип фильтра
                        проверяем, существует ли опция с таким названием (До 75 кг)
                        если да
                            создаём отношение filter_type_filter_option
                            добавляем тип и опцию в товар (product_filter_type_filter_option)
                        иначе
                            создаём опцию
                            создаём отношение filter_type_filter_option
                            добавляем тип и опцию в товар (product_filter_type_filter_option)
         */

        $filterType = FilterType::where('name', $filterTypeName);
        if ($filterType->exists()) {
            $filterType = $filterType->first();
            $filterOption = FilterOption::where('name', $filterOptionName);
            if (!$filterOption->exists()) {
                $filterOption = new FilterOption();
                $filterOption->name = $filterOptionName;
                $filterOption->slug = str_slug($filterOptionName);
                $filterOption->save();
            } else {
                $filterOption = $filterOption->first();
            }
        } else {
            $filterType = new FilterType();
            $filterType->name = $filterTypeName;
            $filterType->slug = str_slug($filterTypeName);
            $filterType->save();
            $filterOption = FilterOption::where('name', $filterOptionName);
            if (!$filterOption->exists()) {
                $filterOption = new FilterOption();
                $filterOption->name = $filterOptionName;
                $filterOption->slug = str_slug($filterOptionName);
                $filterOption->save();
            } else {
                $filterOption = $filterOption->first();
            }
        }

        //Если такой опции у фильтра не существует, добавляем
        if (!FilterTypeFilterOption::where(['filter_type_id' => $filterType->id, 'filter_option_id' => $filterOption->id])->exists()) {
            FilterTypeFilterOption::insert(['filter_type_id' => $filterType->id, 'filter_option_id' => $filterOption->id]);
        }
        //Если у товара такой связки фильтра и опции ещё нет, добавляем
        if ($productId && !ProductFilterTypeFilterOption::where(['product_id' => $productId, 'filter_type_id' => $filterType->id, 'filter_option_id' => $filterOption->id])->exists()) {
            ProductFilterTypeFilterOption::insert(['product_id' => $productId, 'filter_type_id' => $filterType->id, 'filter_option_id' => $filterOption->id]);
        }
    }

    static function getCategoryFilters($productIds, $page=1, $limit=3) {
        $perPage = 5;
        $offset = $page * $perPage - $perPage;
        //id типов фильтров с максимальным кол-вом товаров для данной категории
        $filterTypesCollection = ProductFilterTypeFilterOption::select(
            DB::raw('count(DISTINCT product_id) as products_count'),
            'filter_types.name as filter_type_name',
            'filter_types.slug as filter_type_slug',
            'filter_type_id',
            'filter_option_id'
        )
            ->leftJoin('filter_types', 'product_filter_type_filter_option.filter_type_id', '=', 'filter_types.id')
            ->whereIn('product_id', $productIds)
            ->groupBy('filter_type_id')
            ->orderBy('products_count', 'desc')
            ->orderBy('filter_type_id', 'desc');

        $filtersCount = $filterTypesCollection->get()->count();
        $filterTypesCollection = $filterTypesCollection
            ->limit($limit)
            ->offset($offset);

        //Для каждого фильтра получаем его опции с кол-вом товаров
        $filter = [];
        $filter['count'] = $filtersCount;

        foreach ($filterTypesCollection->get() as $filterType) {
            $options = ProductFilterTypeFilterOption::select(
                DB::raw('count(DISTINCT product_id) as products_count'),
                'filter_options.name as filter_option_name',
                'filter_options.slug as filter_option_slug',
                'filter_type_id',
                'filter_option_id'
            )
                ->leftJoin('filter_options', 'product_filter_type_filter_option.filter_option_id', '=', 'filter_options.id')
                ->where('filter_type_id', $filterType->filter_type_id)
                ->whereIn('product_id', $productIds)
                ->groupBy('filter_option_id')
                ->orderBy('products_count', 'desc')
                ->orderBy('filter_type_id', 'desc');
            $optionsCount = $options->get()->count();
            $options = $options->limit(5)
                ->offset(0)
                ->get();

            //Отметить уже выбранные опции
            foreach ($options as $option) {
                $option->checked = false;
                foreach ($options as $option) {
                    $option->checked = false;
                    if (!empty($option->filter_option_slug) && !empty(\request($filterType->filter_type_slug))) {
                        if (is_array( \request($filterType->filter_type_slug))) {
                            $imploded =  implode(',',  \request($filterType->filter_type_slug));
                        } else {
                            $imploded = \request($filterType->filter_type_slug);
                        }

                        if(!stristr($imploded, $option->filter_option_slug) === FALSE) {
                            $option->checked = true;
                        }
                    }
                }

            }

            $filter['items'][] = [
                'id' => $filterType->filter_type_id,
                'name' => $filterType->filter_type_name,
                'slug' => $filterType->filter_type_slug,
                'options' => [
                    'count' => $optionsCount,
                    'items' => $options
                ]
            ];
        }

        return $filter;
    }

    public static function getMoreFilters($categoryId, $page=1, $limit=5)
    {
        $productIds = Category::getSubcategoryProductsIds($categoryId);
        return FilterType::getCategoryFilters($productIds, $page, $limit);
    }

    public static function getMoreOptions($categoryId, $filterTypeId, $page=1, $limit=5) {
        $productIds = Category::getSubcategoryProductsIds($categoryId);
        if ($filterTypeId == "vendors") {
            return Category::getCategoryBrands($productIds, $page, $limit);
        } else {
            $perPage = 5;
            $offset = $page * $perPage - $perPage;

            $options = ProductFilterTypeFilterOption::select(
                DB::raw('count(DISTINCT product_id) as products_count'),
                'filter_options.name as filter_option_name',
                'filter_options.slug as filter_option_slug',
                'filter_type_id',
                'filter_option_id'
            )
                ->leftJoin('filter_options', 'product_filter_type_filter_option.filter_option_id', '=', 'filter_options.id')
                ->where('filter_type_id', $filterTypeId)
                ->whereIn('product_id', $productIds)
                ->groupBy('filter_option_id')
                ->orderBy('products_count', 'desc')
                ->orderBy('filter_type_id', 'desc');
            $optionsCount = $options->get()->count();
            $options = $options->limit($limit)
                ->offset($offset)
                ->get();

            return ['items' => $options, 'count' => $optionsCount];
        }

    }
}
