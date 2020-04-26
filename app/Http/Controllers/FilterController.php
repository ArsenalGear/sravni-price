<?php

namespace App\Http\Controllers;

use App\FilterType;
use Illuminate\Http\Request;

class FilterController extends Controller
{
    public function checkOptionExistance(Request $request, $filterTypeId)
    {
        $optionId = $request->get('option-id');
        $optionName = $request->get('option-name');
        return FilterType::checkOptionExistance($filterTypeId, $optionId, $optionName);
    }

    //Для админ-панели
    public function getFilterOptions($filterTypeId)
    {
        return FilterType::getFilterOptions($filterTypeId);
    }

    public function getMoreOptions(Request $request, $categoryId)
    {
        if ($request->isMethod('post')) {
            $filterTypeId = \request('filter-type-id');
            $page = \request('page');
            $limit = \request('limit');
            return FilterType::getMoreOptions($categoryId, $filterTypeId, $page, $limit);
        }

    }

    public function getMoreFilters(Request $request, $categoryId)
    {
        if ($request->isMethod('post')) {
            $page = \request('page');
            $limit = \request('limit');
            return FilterType::getMoreFilters($categoryId, $page, $limit);
        }
    }
}
