<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class CustomMenu extends Model
{
    public function category()
    {
        return $this->hasOne('App\Category', 'id', 'category_id');
    }

    static function getMenuItems()
    {

        $menuModel = CustomMenu::with('category')->get();

        foreach ($menuModel as $item) {

            $item->name = "";
            $item->url = "";
            if (!empty($item->custom_name)) {
                $item->name = $item->custom_name;
            } else {
                if (!empty($item->getRelation('category')->name)) {
                    $item->name = $item->getRelation('category')->name;
                }
            }

            $item->name = mb_strimwidth($item->name, 0, 50);

            if (!empty($item->custom_url)) {
                $item->url = $item->custom_url;
            } else {
                if (!empty($item->getRelation('category')->slug)) {
                    //Если есть parent_id его url должен соединяться из url родителей
                    $item->url = $item->getRelation('category')->getUrl();
                }
            }
        }

        return $menuModel;
    }
}
