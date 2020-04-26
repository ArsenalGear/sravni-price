<?php

namespace App\Http\Controllers\Voyager;

use App\CategoriesMapping;
use App\Category;
use App\FilterOption;
use App\FilterType;
use App\Product;
use App\ProductFilterTypeFilterOption;
use App\Review;
use App\Shop;
use DeepCopy\TypeFilter\TypeFilter;
use Illuminate\Queue\Queue;
use MongoDB\BSON\Type;
use TCG\Voyager\Http\Controllers\VoyagerBaseController as BaseVoyagerBaseController;
use TCG\Voyager\Events\BreadDataUpdated;
use Illuminate\Http\Request;
use App\Paginator;
use TCG\Voyager\Facades\Voyager;

class VoyagerBaseController extends BaseVoyagerBaseController
{

    public function index(Request $request)
    {
        // GET THE SLUG, ex. 'posts', 'pages', etc.
        $slug = $this->getSlug($request);

        // GET THE DataType based on the slug
        $dataType = \Voyager::model('DataType')->where('slug', '=', $slug)->first();

        // Check permission
        $this->authorize('browse', app($dataType->model_name));

        $getter = $dataType->server_side ? 'paginate' : 'get';

        $search = (object) ['value' => $request->get('s'), 'key' => $request->get('key'), 'filter' => $request->get('filter')];
        $searchable = $dataType->server_side ? array_keys(SchemaManager::describeTable(app($dataType->model_name)->getTable())->toArray()) : '';
        $orderBy = $request->get('order_by', $dataType->order_column);
        $sortOrder = $request->get('sort_order', null);
        $usesSoftDeletes = false;
        $showSoftDeleted = false;
        $orderColumn = [];
        if ($orderBy) {
            $index = $dataType->browseRows->where('field', $orderBy)->keys()->first() + 1;
            $orderColumn = [[$index, 'desc']];
            if (!$sortOrder && isset($dataType->order_direction)) {
                $sortOrder = $dataType->order_direction;
                $orderColumn = [[$index, $dataType->order_direction]];
            } else {
                $orderColumn = [[$index, 'desc']];
            }
        }

        // Next Get or Paginate the actual content from the MODEL that corresponds to the slug DataType
        if (strlen($dataType->model_name) != 0) {
            $model = app($dataType->model_name);

            if ($dataType->scope && $dataType->scope != '' && method_exists($model, 'scope'.ucfirst($dataType->scope))) {
                $query = $model->{$dataType->scope}();
            } else {
                $query = $model::select('*');
            }

            //Фикс админ-панели: собственная пагинация (иначе бесконечная загрузка при большем количестве записей)
            if(empty($request->get('per_page'))) {
                $perPage = 10;
            } else {
                $perPage = $request->get('per_page');
            }

            $countOfItems = $query->count();
            $active = !empty($request->get('page')) ? $request->get('page') : 1;
            $query = $query->limit($perPage)->offset(intval($active-1) * $perPage);
            $paginator = Paginator::createAdminPaginationHtml($countOfItems, $perPage, $active);

            //Фикс админ-панели: end

            // Use withTrashed() if model uses SoftDeletes and if toggle is selected
            if ($model && in_array(SoftDeletes::class, class_uses($model)) && app('VoyagerAuth')->user()->can('delete', app($dataType->model_name))) {
                $usesSoftDeletes = true;

                if ($request->get('showSoftDeleted')) {
                    $showSoftDeleted = true;
                    $query = $query->withTrashed();
                }
            }

            // If a column has a relationship associated with it, we do not want to show that field
            $this->removeRelationshipField($dataType, 'browse');

            if ($search->value != '' && $search->key && $search->filter) {
                $search_filter = ($search->filter == 'equals') ? '=' : 'LIKE';
                $search_value = ($search->filter == 'equals') ? $search->value : '%'.$search->value.'%';
                $query->where($search->key, $search_filter, $search_value);
            }

            if ($orderBy && in_array($orderBy, $dataType->fields())) {
                $querySortOrder = (!empty($sortOrder)) ? $sortOrder : 'desc';
                $dataTypeContent = call_user_func([
                    $query->orderBy($orderBy, $querySortOrder),
                    $getter,
                ]);
            } elseif ($model->timestamps) {
                $dataTypeContent = call_user_func([$query->latest($model::CREATED_AT), $getter]);
            } else {
                $dataTypeContent = call_user_func([$query->orderBy($model->getKeyName(), 'DESC'), $getter]);
            }

            // Replace relationships' keys for labels and create READ links if a slug is provided.
            $dataTypeContent = $this->resolveRelations($dataTypeContent, $dataType);
        } else {
            // If Model doesn't exist, get data from table name
            $dataTypeContent = call_user_func([DB::table($dataType->name), $getter]);
            $model = false;
        }

        // Check if BREAD is Translatable
        if (($isModelTranslatable = is_bread_translatable($model))) {
            $dataTypeContent->load('translations');
        }

        // Check if server side pagination is enabled
        $isServerSide = isset($dataType->server_side) && $dataType->server_side;

        // Check if a default search key is set
        $defaultSearchKey = $dataType->default_search_key ?? null;

        $view = 'voyager::bread.browse';

        if (view()->exists("voyager::$slug.browse")) {
            $view = "voyager::$slug.browse";
        }

        $isParsingNow = ['shop_id' => 0, 'job_name' => ''];
        $inQueue = array();
        if ($dataType->name == 'shops') {
            $queue = \DB::table('jobs')->get();
            foreach ($queue as $job) {
                $shopId = unserialize(json_decode($job->payload, true)['data']['command'])->shopId;
                $jobName = json_decode($job->payload, true)['data']['commandName'];
                if ($job->attempts) {
                    $isParsingNow = ['job_name' => $jobName, 'shop_id' => $shopId];
                } else {
                    $inQueue[$jobName][] = $shopId;
                }
            }
        }


        if ($dataType->name == 'reviews') {
            $productIds = $dataTypeContent->pluck('product_id')->unique();
            $products = Product::select(
                    'category_product.product_id',
                    'products.name as product_name',
                    'products.slug as product_slug',
                    'categories.path as category_path'
                )
                ->leftJoin('category_product', 'products.id', '=', 'category_product.product_id')
                ->leftJoin('categories', 'category_product.category_id', '=', 'categories.id')
                ->whereIn('products.id', $productIds)
                ->get();

            $productsArr = [];
            foreach ($products as $product) {
                $productsArr[$product->product_id] = '<a href="/catalog/' . $product->category_path . '/products/' . $product->product_slug . '">' . $product->product_name . '</a>';
            }

            if (!empty($productsArr)) {
                foreach ($dataTypeContent as $content) {
                    $content->product_id = $productsArr[$content->product_id];
                }
            }
        }

        return \Voyager::view($view, compact(
            'dataType',
            'dataTypeContent',
            'isModelTranslatable',
            'search',
            'orderBy',
            'orderColumn',
            'sortOrder',
            'searchable',
            'isServerSide',
            'defaultSearchKey',
            'usesSoftDeletes',
            'showSoftDeleted',
            'isParsingNow',
            'inQueue',
            'paginator'
        ));
    }

    public function relation(Request $request)
    {
        $slug = $this->getSlug($request);
        $page = $request->input('page');
        $on_page = 50;
        $search = $request->input('search', false);
        $dataType = \Voyager::model('DataType')->where('slug', '=', $slug)->first();

        foreach ($dataType->editRows as $key => $row) {
            if ($row->field === $request->input('type')) {
                $options = $row->details;
                $skip = $on_page * ($page - 1);

                // If search query, use LIKE to filter results depending on field label
                if ($search) {
                    $total_count = app($options->model)->where($options->label, 'LIKE', '%'.$search.'%')->count();
                    $relationshipOptions = app($options->model)->take($on_page)->skip($skip)
                        ->where($options->label, 'LIKE', '%'.$search.'%')
                        ->get();
                } else {
                    $total_count = app($options->model)->count();
                    $relationshipOptions = app($options->model)->take($on_page)->skip($skip)->get();
                }

                $results = [];
                foreach ($relationshipOptions as $relationshipOption) {
                    $results[] = [
                        'id'   => $relationshipOption->{$options->key},
                        'text' => $relationshipOption->{$options->label},
                    ];
                }

                if ($row->field == 'category_belongsto_category_relationship') {
                    array_push($results, ['id'=>" ", 'text' => 'Отсутствует']);
                }

                return response()->json([
                    'results'    => $results,
                    'pagination' => [
                        'more' => ($total_count > ($skip + $on_page)),
                    ],
                ]);
            }
        }

        // No result found, return empty array
        return response()->json([], 404);
    }

    public function edit(Request $request, $id)
    {
        $slug = $this->getSlug($request);

        $dataType = \Voyager::model('DataType')->where('slug', '=', $slug)->first();

        //Получаем список добавленных магазинов для товаров
        $shopProducts = [];
        $shopProductsArr = [];
        if ($dataType->name == 'products') {
            $shopProducts = Product::find($id)->shops;
            foreach ($shopProducts as $shopProduct) {
                $shopProductsArr[$shopProduct->id] = ['shop_id' => $shopProduct->id , 'price' => $shopProduct->pivot->price, 'url' => $shopProduct->pivot->url];
            }
            $shopProductsJSON = json_encode($shopProductsArr);
        }

        if ($dataType->name == 'products') {
            $listHtml = $this->getCustomRelationshipItemsList( new Request(), 'categories', $id);

            $categoriesList = $this->getItems($id, 10, 0, 'categories')['items'];
            $categoriesListHtml = "";
            foreach ($categoriesList as $category) {
                $categoriesListHtml = $categoriesListHtml . '<li data-item-id="' . $category->id .'">' . $category->name . '</li>';
            }
            $dataTypeName = "categories";
            $customRelationshipBlock =
                '<div class="form-group col-md-12 database-items">
                    <label>Добавить категорию:</label>
                    <div class="database-items__list form-control" data-type="' . $dataTypeName . '" data-offset="10">
                        <ul>' . $categoriesListHtml . ' </ul>
                    </div>
                    
                    <div style="display: none;" class="new-items-' . $dataTypeName . '">
                    <label>Новые</label>
                        <div class="new-items-'  . $dataTypeName . '__list">
                            <ul></ul>
                        </div>
                    </div>
                    
                    <div style="display: none;" class="delete-items-' . $dataTypeName . '" data-type="' . $dataTypeName . '">
                        <label>Будут удалены:</label>
                        <div class="delete-items-' . $dataTypeName . '__list">
                            <ul></ul>
                        </div>
                    </div>
                    <div class="old-items" data-type="' . $dataTypeName . '">
                        <label>Ранее добавленные</label>
                        <div class="old-items__list" data-type="' . $dataTypeName . '">
                           ' . $listHtml . '
                        </div>
                    </div>
                    
                    <input type="hidden" class="items-arr" name="items-arr">
                    <script>pageId = ' . $id . '</script> 
                    </div> ';

            $dataTypeName = "filter-types";
            $filterTypesList = $this->getItems($id, 10, 0, $dataTypeName)['items'];
            $filterTypesListHtml = "";
            foreach ($filterTypesList as $filterType) {
                $filterTypesListHtml = $filterTypesListHtml . '<li data-item-id="' . $filterType->id .'">' . $filterType->name . '</li>';
            }

            $customRelationshipBlock  = $customRelationshipBlock .
                '<div class="form-group col-md-12 database-items">
	                <label>Добавить тип фильтра:</label>
	                <div class="database-items__list form-control" data-type="' . $dataTypeName . '" data-offset="10">
	                    <ul>' . $filterTypesListHtml . ' </ul>
                    </div>
	                
	                <div style="display: none;" class="new-items-products">
                    <label>Новые</label>
                        <div class="new-items-' . $dataTypeName . '__list">
                            <ul></ul>
                        </div>
                    </div>
                    
                    <div style="display: none;" class="delete-items" data-type="' . $dataTypeName . '">
                        <label>Будут удалены:</label>
                        <div class="delete-items__list">
                            <ul></ul>
                        </div>
                    </div>
                    
                    
                    <input type="hidden" class="items-arr" name="items-arr">
                    <script>pageId = ' . $id . '</script> 
                    </div>';

            $listHtml = $this->getCustomRelationshipItemsList( new Request(), 'filter-types', $id);
            $dataTypeName = 'filter-options';
            $customRelationshipBlock = $customRelationshipBlock .
                '<div class="form-group col-md-12 database-items">
                    <label>Добавить опцию фильтра:</label>
	                <div class="database-items__list form-control" data-type="' . $dataTypeName . '" data-offset="0">
	                    <ul></ul>
                    </div>
                    <button type="button" class="button button btn btn-success add-filter-to-new-items">+</button>
                <input type="hidden" name="filter-types-arr" class="filter-types-arr">
                <div style="display: none;" class="new-items-' . $dataTypeName . '">
                    <label>Новые</label>
                    <div class="new-items-' . $dataTypeName . '__list">
                        <ul></ul>
                    </div>
                </div>
                
                <div style="display: none;" class="delete-items-' . $dataTypeName . '">
                    <label>Будут удалены:</label>
                    <div class="delete-items-' . $dataTypeName . '__list">
                        <ul></ul>
                    </div>
                </div>
                <div class="old-items">
                    <label>Ранее добавленные</label>
                    <div class="old-items__list" data-type="' . $dataTypeName .'">
                        ' . $listHtml . '   
                    </div>
                </div>
                
                <script>pageId = ' . $id . '</script> 
                </div>
            ';
        }

        if ($dataType->name == 'categories') {
            $listHtml = $this->getCustomRelationshipItemsList( new Request(), 'products', $id);

            $productsList = $this->getItems($id, 10, 0, 'products')['items'];
            $productsListHtml = "";
            foreach ($productsList as $product) {
                $productsListHtml = $productsListHtml . '<li data-item-id="' . $product->id .'">' . $product->name . '</li>';
            }

            $customRelationshipBlock =
                '<div class="form-group col-md-12 database-items">
	                <label>Добавить товары:</label>
	                <div class="database-items__list form-control" data-type="products" data-offset="10">
	                    <ul>' . $productsListHtml . ' </ul>
                    </div>
	                
	                <div style="display: none;" class="new-items-products">
                    <label>Новые</label>
                        <div class="new-items-products__list">
                            <ul></ul>
                        </div>
                    </div>
                    
                    <div style="display: none;" class="delete-items-products" data-type="products">
                        <label>Будут удалены:</label>
                        <div class="delete-items-products__list">
                            <ul></ul>
                        </div>
                    </div>
                    <div class="old-items" data-type="products">
                        <label>Ранее добавленные</div>
                        <div class="old-items__list" data-type="products">
                           ' . $listHtml . '
                        </div>
                    </div>
                    
                    <input type="hidden" class="items-arr" name="items-arr">
                    <script>pageId = ' . $id . '</script> 
                    </div>  
                </div>';
        }

        if ($dataType->name == "filter_types") {

            $listHtml = $this->getCustomRelationshipItemsList( new Request(), 'options', $id);

            $customRelationshipBlock =
                '<label class="control-label" for="name">Опции фильтра</label>
                <div class="form-group  col-md-12 custom-relation" data-type="options">
                <label class="control-label" for="name">Добавить опцию</label>
                <input type="text" class="form-control new-item">
                <input type="hidden" class="type-filter-options-add-delete" name="type-filter-options-add-delete">
                <button type="button" class="button button btn btn-success add-item-to-new-items">+</button>
                
                <div style="display: none;" class="new-items">
                    <label>Новые</label>
                    <div class="new-items__list">
                        <ul></ul>
                    </div>
                </div>
                
                <div style="display: none;" class="delete-items">
                    <label>Будут удалены:</label>
                    <div class="delete-items__list">
                        <ul></ul>
                    </div>
                </div>
                <div class="old-items">
                    <label>Ранее добавленные</div>
                    <div class="old-items__list">
                       ' . $listHtml . '
                    </div>
                </div>
                
                <script>pageId = ' . $id . '</script> 
                </div>      
            ';
        }

        if (strlen($dataType->model_name) != 0) {

            $model = app($dataType->model_name);

            // Use withTrashed() if model uses SoftDeletes and if toggle is selected
            if ($model && in_array(SoftDeletes::class, class_uses($model))) {
                $model = $model->withTrashed();
            }
            if ($dataType->scope && $dataType->scope != '' && method_exists($model, 'scope'.ucfirst($dataType->scope))) {
                $model = $model->{$dataType->scope}();
            }
            $dataTypeContent = call_user_func([$model, 'findOrFail'], $id);
        } else {
            // If Model doest exist, get data from table name
            $dataTypeContent = DB::table($dataType->name)->where('id', $id)->first();
        }

        foreach ($dataType->editRows as $key => $row) {
            $dataType->editRows[$key]['col_width'] = isset($row->details->width) ? $row->details->width : 100;
        }

        // If a column has a relationship associated with it, we do not want to show that field
        $this->removeRelationshipField($dataType, 'edit');

        // Check permission
        $this->authorize('edit', $dataTypeContent);

        // Check if BREAD is Translatable
        $isModelTranslatable = is_bread_translatable($dataTypeContent);

        $view = 'voyager::bread.edit-add';

        if (view()->exists("voyager::$slug.edit-add")) {
            $view = "voyager::$slug.edit-add";
        }



        return \Voyager::view($view, compact(
            'dataType',
            'dataTypeContent',
            'isModelTranslatable',
            'shopProducts',
            'shopProductsJSON',
            'customRelationshipBlock',
            'pageId'
            )
        );
    }

    public function getItems($id, $limit=false, $offset=false, $type = false) {
        if (!$type) {
            $type = \request('type');
        }

        if (!$offset) {
            $offset = \request('offset');
        }

        if (!$limit) {
            $limit = 10;
        }

        switch ($type) {
            case "products":
                //Товары, которых нет в данной категории
                $items = Product::select(
                    'products.id as id',
                    'name',
                    'category_id'
                )
                ->leftJoin('category_product', 'products.id', 'category_product.product_id');

                if ($id) {
                    $excludedItems = $items->where('category_id', $id)->get()->pluck('id')->unique();
                    $items = Product::whereNotIn('id', $excludedItems);
                } else {
                    $items = Product::distinct();
                }

                $items = $items
                    ->limit($limit)
                    ->offset($offset)
                    ->get();
            break;
            case "categories":
                //Категории, которым не пренадлежит данный товар
                $items = Category::select(
                    'categories.id as id',
                    'name'
                )
                ->leftJoin('category_product', 'categories.id', 'category_product.category_id');

                if ($id) {
                    $excludedItems = $items->where('product_id', $id)->get()->pluck('id')->unique();
                    $items = Category::whereNotIn('id', $excludedItems);
                } else {
                    $items = Category::distinct();
                }

                $items = $items
                    ->limit($limit)
                    ->offset($offset)
                    ->get();
            break;
            case "filter-types":
                //Типы фильтров
                $items = FilterType::limit($limit)
                    ->offset($offset)
                    ->get();
            break;
        }

        if (isset($items) && !empty($items)) {
            return ['success' => 1, 'items' => $items];
        }
    }

    //Для ajax пагинации
    public function getCustomRelationshipItemsList(Request $request, $prefix=false, $id=false) {

        if (!$prefix){
            $prefix = $request->get('prefix');
        }
        if (!$id) {
            $id = $request->get('id');
        }

        $active = !empty($request->get($prefix . '_page')) ? $request->get($prefix . '_page') : 1;

        if(empty($request->get($prefix . '_per_page'))) {
            $perPage = 10;
        } else {
            $perPage = $request->get($prefix . '_per_page');
        }

        $offset = intval($active-1) * $perPage;

        switch ($prefix) {
            case 'options':
                $list = FilterType::find($id)->filterOptions();
                break;
            case 'products':
                $list = Category::find($id)->products();
                break;
            case 'categories':
                $list = Product::find($id)->category();
                break;
            case 'filter-types':
                $list = \DB::table('product_filter_type_filter_option')
                    ->leftJoin('filter_types', 'filter_types.id', '=', 'product_filter_type_filter_option.filter_type_id')
                    ->leftJoin('filter_options', 'filter_options.id', '=', 'product_filter_type_filter_option.filter_option_id')
                    ->select(
                        'product_filter_type_filter_option.id',
                        'filter_types.id as filter_type_id',
                        'filter_types.name as filter_type_name',
                        'filter_options.id as filter_option_id',
                        'filter_options.name as filter_option_name'
                    )
                    ->where('product_id', $id);
                break;
          case 'categories-mappings':
              $list = CategoriesMapping::where('shop_id', $id);
              break;
        }

        $countOfItems = $list->count();
        if ($prefix !== 'filter-types') {
            $list = $list->limit($perPage)->offset($offset)->get();
        } else {
            $list = $list->limit($perPage)->offset($offset)->orderBy('filter_type_id')->get();
        }


        $listHtml = "";
        if ($list->count() > 0) {
            foreach ($list as $item) {
                if ($prefix !== 'filter-types') {
                    $listHtml = $listHtml . '<li class="item-' . $item->id . '"><span class="item-name">' . $item->name . '</span> <span class="add-item-to-delete-items">удалить</span></li>';
                } else {
                    $listHtml = $listHtml . '<li class="item-' . $item->id . '"><span class="item-name">' . $item->filter_type_name . ': ' . $item->filter_option_name . '</span> <span class="add-item-to-delete-items">удалить</span></li>';
                }
            }
        } else {
            $listHtml = "<li>отсутствуют</li>";
        }

        $paginator = Paginator::createAdminPaginationHtml($countOfItems, $perPage, $active, $prefix);

        return "<ul>" . $listHtml . "</ul>" . $paginator;
    }

    // POST BR(E)AD
    public function update(Request $request, $id)
    {
        $slug = $this->getSlug($request);

        $dataType = \Voyager::model('DataType')->where('slug', '=', $slug)->first();

        if ($dataType->name == 'products') {
            $itemsArr = \request('items-arr');
            if (isset ($itemsArr) && !empty($itemsArr)) {
                $itemsArr = json_decode($itemsArr, true);

                $product = Product::find($id);

                if (isset($itemsArr['categories'])) {

                    $addArr = [];
                    foreach ($itemsArr['categories']['add'] as $id => $name) {
                        $addArr[] = $id;
                    }

                    if (!empty($addArr)) {
                        $product->category()->attach($addArr);
                    }
                }

                if (isset($itemsArr['categories'])) {
                    $deleteArr = [];
                    foreach ($itemsArr['categories']['delete'] as $id => $name) {
                        $deleteArr[] = $id;
                    }

                    if (!empty($deleteArr)) {
                        $product->category()->detach($deleteArr);
                    }
                }

                if (isset($itemsArr['filter-options'])) {

                    $deleteArr = array_keys($itemsArr['filter-options']['delete']);

                    if (!empty($deleteArr)) {
                        ProductFilterTypeFilterOption::whereIn('id', $deleteArr)->delete($deleteArr);
                    }
                }
            }

            $filterTypesArr = \request('filter-types-arr');
            $filterItems = [];
            if (isset ($filterTypesArr) && !empty($filterTypesArr)) {
                $filterTypesArr = json_decode($filterTypesArr);
                if (isset($filterTypesArr->add) && ! empty($filterTypesArr->add)) {
                  foreach ($filterTypesArr->add as $filterTypeId => $filterOptions) {
                      foreach ($filterOptions as $filterOptionId) {
                          $filterItems[] = ['product_id' => $id, 'filter_type_id' => $filterTypeId, 'filter_option_id' => $filterOptionId];
                      }
                  }
                }
                $product->productFilterTypeFilterOptions()->attach($filterItems);
            }

            $productShops = \request('product-shops');

            if (!empty($productShops) && isset($productShops)) {
                $product = Product::find($id);
                $productShops = json_decode($productShops, true);
                unset($productShops[0]);
                foreach ($productShops as $i => $productShop) {
                    if (empty($productShop)) {
                        unset($productShops[$i]);
                    }
                }
                //Находим самую низкую цену в массиве
                $minPrice =  min(array_column($productShops, 'price'));
                //Находим магазин с этой ценой и получаем его url

                foreach ($productShops as $shop) {
                    if ($shop['price'] == $minPrice) {
                        $minPriceShopUrl = $shop['url'];
                    }
                }

                //Записываем в товар
                $product->min_price = $minPrice;
                $product->min_price_shop_url = $minPriceShopUrl;
                $product->shops_count = count($productShops);
                $product->save();
                $product->shops()->sync($productShops);
            }
        }

        if ($dataType->name == 'filter_types') {
            $options = $request->get('type-filter-options-add-delete');
            if (!empty($options)) {
                $options = json_decode($options);
            }

            if (isset($options->add) && !empty($options->add)) {

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
                    FilterType::find($id)->filterOptions()->attach($filterOption->id);
                }

            }

            if (isset($options->delete) && !empty($options->delete)) {
                foreach ($options->delete as $option) {
                    FilterType::find($id)->filterOptions()->detach([$option]);
                }
            }
        }


        // Compatibility with Model binding.
        $id = $id instanceof Model ? $id->{$id->getKeyName()} : $id;

        $model = app($dataType->model_name);
        if ($dataType->scope && $dataType->scope != '' && method_exists($model, 'scope'.ucfirst($dataType->scope))) {
            $model = $model->{$dataType->scope}();
        }
        if ($model && in_array(SoftDeletes::class, class_uses($model))) {
            $data = $model->withTrashed()->findOrFail($id);
        } else {
            $data = call_user_func([$dataType->model_name, 'findOrFail'], $id);
        }

        // Check permission
        $this->authorize('edit', $data);

        // Validate fields with ajax
        $val = $this->validateBread($request->all(), $dataType->editRows, $dataType->name, $id)->validate();
        $this->insertUpdateData($request, $slug, $dataType->editRows, $data);

        event(new BreadDataUpdated($dataType, $data));

        if ($dataType->name=='categories') {
            $itemsArr = \request('items-arr');
            if (!empty($itemsArr) && isset($itemsArr)) {
                $itemsArr = json_decode($itemsArr, true);
            }
            $category = Category::find($id);

            if (isset($itemsArr['products'])) {

                $addArr = [];
                foreach ($itemsArr['products']['add'] as $id => $name) {
                    $addArr[] = $id;
                }

                if (!empty($addArr)) {
                    $category->products()->attach($addArr);
                }
            }

            if (isset($itemsArr['products'])) {

                $deleteArr = [];
                foreach ($itemsArr['products']['delete'] as $id => $name) {
                    $deleteArr[] = $id;
                }

                if (!empty($deleteArr)) {
                    $category->products()->detach($deleteArr);
                }
            }
        }

        return redirect()
            ->route("voyager.{$dataType->slug}.index")
            ->with([
                'message'    => __('voyager::generic.successfully_updated')." {$dataType->display_name_singular}",
                'alert-type' => 'success',
            ]);
    }

    //***************************************
    //
    //                   /\
    //                  /  \
    //                 / /\ \
    //                / ____ \
    //               /_/    \_\
    //
    //
    // Add a new item of our Data Type BRE(A)D
    //
    //****************************************
    public function create(Request $request)
    {
        $slug = $this->getSlug($request);

        $dataType = Voyager::model('DataType')->where('slug', '=', $slug)->first();

        if ($dataType->name == "filter_types") {
            $customRelationshipBlock =
                '<label class="control-label" for="name">Опции фильтра</label>
                <div class="form-group  col-md-12 ">
                <label class="control-label" for="name">Добавить опцию</label>
                <input type="text" class="form-control new-item">
                <input type="hidden" class="type-filter-options-add-delete" name="type-filter-options-add-delete">
                <button type="button" class="button button btn btn-success add-item-to-new-items">+</button>
                
                <div style="display: none;" class="new-items">
                    <label>Новые</label>
                    <div class="new-items__list">
                        <ul></ul>
                    </div>
                </div>
                
                </div>      
            ';
        }

        if ($dataType->name == "categories") {

            $productsList = $this->getItems(false, 10, 0, 'products')['items'];
            $productsListHtml = "";
            foreach ($productsList as $product) {
                $productsListHtml = $productsListHtml . '<li data-item-id="' . $product->id .'">' . $product->name . '</li>';
            }

            $customRelationshipBlock =
                '<div class="form-group col-md-12 database-items">
	                <label>Добавить товары:</label>
	                <div class="database-items__list form-control" data-type="products" data-offset="10">
	                    <ul>' . $productsListHtml . ' </ul>
                    </div>
	                
	                <div style="display: none;" class="new-items-products">
                    <label>Новые</label>
                        <div class="new-items-products__list">
                            <ul></ul>
                        </div>
                    </div>
                    <input type="hidden" class="items-arr" name="items-arr"> 
                    </div>  
                </div>';
        }

        if ($dataType->name == 'products') {
            $categoriesList = $this->getItems(false, 10, 0, 'categories')['items'];
            $categoriesListHtml = "";
            foreach ($categoriesList as $category) {
                $categoriesListHtml = $categoriesListHtml . '<li data-item-id="' . $category->id .'">' . $category->name . '</li>';
            }
            $dataTypeName = "products";
            $customRelationshipBlock =
                '<div class="form-group col-md-12 database-items">
	                <label>Добавить категорию:</label>
	                <div class="database-items__list form-control" data-type="' . $dataTypeName . '" data-offset="10">
	                    <ul>' . $categoriesListHtml . ' </ul>
                    </div>
	                
	                <div style="display: none;" class="new-items-' . $dataTypeName . '">
                    <label>Новые</label>
                        <div class="new-items-'  . $dataTypeName . '__list">
                            <ul></ul>
                        </div>
                    </div>
                    
                    <input type="hidden" class="items-arr" name="items-arr">
                </div>';

            $dataTypeName = "filter-types";
            $filterTypesList = $this->getItems(false, 10, 0, $dataTypeName)['items'];
            $filterTypesListHtml = "";
            foreach ($filterTypesList as $filterType) {
                $filterTypesListHtml = $filterTypesListHtml . '<li data-item-id="' . $filterType->id .'">' . $filterType->name . '</li>';
            }

            $customRelationshipBlock  = $customRelationshipBlock .
                '<div class="form-group col-md-12 database-items">
	                <label>Добавить тип фильтра:</label>
	                <div class="database-items__list form-control" data-type="' . $dataTypeName . '" data-offset="10">
	                    <ul>' . $filterTypesListHtml . ' </ul>
                    </div>
	                
	                <div style="display: none;" class="new-items-products">
                    <label>Новые</label>
                        <div class="new-items-' . $dataTypeName . '__list">
                            <ul></ul>
                        </div>
                    </div>
                      
                    <input type="hidden" class="items-arr" name="items-arr">
                    </div>';

            $dataTypeName = 'filter-options';
            $customRelationshipBlock = $customRelationshipBlock .
                '<div class="form-group col-md-12 database-items">
                    <label>Добавить опцию фильтра:</label>
	                <div class="database-items__list form-control" data-type="' . $dataTypeName . '" data-offset="0">
	                    <ul></ul>
                    </div>
                    <button type="button" class="button button btn btn-success add-filter-to-new-items">+</button>
                <input type="hidden" name="filter-types-arr" class="filter-types-arr">
                <div style="display: none;" class="new-items-' . $dataTypeName . '">
                    <label>Новые</label>
                    <div class="new-items-' . $dataTypeName . '__list">
                        <ul></ul>
                    </div>
                </div>  
                </div>
            ';
        }

        // Check permission
        $this->authorize('add', app($dataType->model_name));

        $dataTypeContent = (strlen($dataType->model_name) != 0)
            ? new $dataType->model_name()
            : false;


        foreach ($dataType->addRows as $key => $row) {
            $dataType->addRows[$key]['col_width'] = $row->details->width ?? 100;
        }

        // If a column has a relationship associated with it, we do not want to show that field
        $this->removeRelationshipField($dataType, 'add');

        // Check if BREAD is Translatable
        $isModelTranslatable = is_bread_translatable($dataTypeContent);

        $view = 'voyager::bread.edit-add';

        if (view()->exists("voyager::$slug.edit-add")) {
            $view = "voyager::$slug.edit-add";}

        return Voyager::view($view, compact('dataType', 'dataTypeContent', 'isModelTranslatable', 'customRelationshipBlock'));
    }

    public function approveReview($reviewId)
    {
        //Изменяем значение approved на противоположное (отзывы с approved = 0 будут скрыты)
        $review = Review::find($reviewId)->toggleFlag('approved');
        $review->save();
        //Кешируем данные о среднем рейтинге и кол-ве отзывов у товара
        Product::cacheProductAvgRateAndReviewsCount($review->product_id);
        //Также необходимо пересчитывать рейтинг и кол-во отзывов для товара при удалении отзыва

    }

}
