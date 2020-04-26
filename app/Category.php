<?php

namespace App;

use http\Env\Request;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\DB;

class Category extends Model
{
    use \Kalnoy\Nestedset\NodeTrait;

    public $path;
    public $path_names;

    protected $appends = ['parents'];

    public function category()
    {
        return $this->belongsTo('App\Category');
    }

    public function categoryChildren()
    {
        return $this->hasMany('App\Category', 'parent_id');
    }

    public function Products()
    {
        return $this->belongsToMany('App\Product');
    }

    public static function boot()
    {

        parent::boot();

        static::saving(function ( $model) {
            if ($model->isDirty('name', 'slug', 'parent_id')) {
                $model->generatePath();
                $model->generatePathNames();
            }
        });

        static::saved(function (self $model) {
            // Данная переменная нужна для того, чтобы потомки не начали вызывать
            // метод, т.к. для них путь также изменится
            static $updating = false;
            static $updating2 = false;

            if ( !$updating2 && $model->isDirty('name', 'slug', 'parent_id')) {

                $updating2 = true;
                $model->setAttribute('path', $model->path)->save();
                $model->setAttribute('path_names', $model->path_names)->save();
                $updating2 = false;
            }

            if ( !$updating && $model->isDirty('path') || $model->isDirty('path_name')) {

                $updating = true;

                $model->updateDescendantsPaths();

                $updating = false;
            }
        });

        static::created(function ($category) {
            $itemsArr = \request('items-arr');
            if (!empty($itemsArr) && isset($itemsArr)) {
                $itemsArr = json_decode($itemsArr, true);
            }

            if (isset($itemsArr['products'])) {

                $addArr = [];
                foreach ($itemsArr['products']['add'] as $id => $name) {
                    $addArr[] = $id;
                }

                if (!empty($addArr)) {
                    $category->products()->attach($addArr);
                }
            }
        });

    }

    public function getParentsAttribute()
    {
        $collection = collect([]);
        $parent = $this->parent;
        while($parent) {
            $collection->push($parent);
            $parent = $parent->parent;
        }

        return $collection;
    }

    public function generatePath()
    {
        $slugs = $this->ancestors()->pluck('slug')->toArray();
        $slugs[] = $this->slug;

        $this->path = implode('/', $slugs);

        return $this;
    }

    public function generatePathNames()
    {
      $slugs = $this->ancestors()->pluck('name')->toArray();
      $slugs[] = $this->name;

      $this->path_names = implode('/', $slugs);

      return $this;
    }

    public function updateDescendantsPaths()
    {
        // Получаем всех потомков в древовидном порядке
        $descendants = $this->descendants()->defaultOrder()->get();

        // Данный метод заполняет отношения parent и children
        $descendants->push($this)->linkNodes()->pop();

        foreach ($descendants as $model) {
            $model->generatePath()->save();
            $model->generatePathNames()->save();
        }
    }

    // Получение ссылки
    public function getUrl()
    {
        $this->generatePath();
        return 'catalog/' . $this->path;
    }

    static function getCategoryBrands($productIds, $page=1, $limit=5)
    {
        $perPage = 5;
        $offset = $page * $perPage - $perPage;
        $brands = DB::table('products')
            ->select(
                DB::raw('count(`products`.id) as products_count'),
                'vendor_id',
                'vendors.name'
            )
            ->leftJoin('vendors', 'products.vendor_id', '=', 'vendors.id')
            ->groupBy('vendor_id')
            ->orderBy('products_count', 'DESC')
            ->whereIn('products.id', $productIds);

        $brandsCount = $brands->get()->count();

        $brands = $brands->limit($limit)
            ->offset($offset)
            ->get();

        foreach ($brands as $brand) {
            $brand->checked = false;
            $vendors = \request('vendors');
            if (isset($vendors) && !empty($vendors)) {
                foreach ($vendors as $i => $vendor) {
                    if(!stristr($vendor, ',') === FALSE) {
                        $vendorValues = explode(',', $vendor);
                        unset($vendors[$i]);
                        foreach ($vendorValues as $vendorValue) {
                            $vendors[] = $vendorValue;
                        }
                    }
                }

                foreach ($vendors as $vendor) {
                    if (in_array($brand->vendor_id, $vendors)) {
                        $brand->checked = true;
                    }
                }
            }
        }

        return ['items' => $brands->unique(), 'count' => $brandsCount];
    }


    static function getSubcategoryProductsIds($categoryId)
    {
        $category = Category::find($categoryId);
        $subcats = $category->categoryChildren()->select('id', 'name', 'path')->withCount('products')->get();

        //Для каждой подкатегории отдельно нужно получить входящие в неё катеории
        foreach ($subcats as $subcat) {
            $categorySubcatIds = Category::find($subcat->id)->descendants()->pluck('id');
            $subcatsCount = Product::leftJoin('category_product', 'category_product.product_id', '=', 'products.id')
                ->whereIn('category_product.category_id', $categorySubcatIds)
                ->count();
            $subcat->products_count = $subcatsCount + $subcat->products_count;
        }

        //id всех подкатегорий с глубокой вложенностью
        $subcatsIds = $category->descendants()->pluck('id');
        $subcatsIds[] = $category->id;
        $subcatsIds = $subcatsIds->unique();

        //Получаем товары данной категории и всех подкатегорий
        $products = Product::leftJoin('category_product', 'category_product.product_id', '=', 'products.id')
            ->whereIn('category_product.category_id', $subcatsIds);

        if ( \request('isSales') == 'true') {
            $products = $products->where('old_price', '!=', '')->whereNotNull('old_price');
        }

        $productIds = $products->pluck('products.id')->toArray();

        return $productIds;
    }
}
