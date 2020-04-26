@extends('layouts.wrapper')

@section('content')

<main>
    <div class="breadcrumbs">
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <div class="breadcrumbs__wrapper">
                        @foreach ($breadcrumbs as $breadcrumb)
                            @if(!$breadcrumb['last'])
                                <a class="breadcrumbs__link" href="/{{$catalogAlias}}/{{$breadcrumb['url']}}">{{$breadcrumb['name']}}</a>
                                <span class="breadcrumbs__divider">/</span>
                            @else
                                <span class="breadcrumbs__link breadcrumbs__link-last">{{$breadcrumb['name']}}</span>
                            @endif
                        @endforeach
                    </div>
                </div>
            </div>
        </div>
    </div>
    <section class="title-goods">
        <div class="container">
            <div class="row">
                <div class="col-12">
                    @if ($catalogAlias == 'sales')
                        @if ($category->parent()->exists())
                            {{--Для категорий первого уровня--}}
                            <h1 class="title-goods__title">Скидки на {{$category->name}}</h1>
                        @else
                            {{--Для подкатегорий--}}
                            <h1 class="title-goods__title">Скидки в категории {{$category->name}}</h1>
                        @endif
                    @else
                        <h1 class="title-goods__title">{{$category->name}}</h1>
                    @endif
                </div>
                <div class="col-12">
                    <p class="title-goods__choose">
                        <span> Уточнить выбор </span>
                    </p>
                </div>
            </div>
        </div>
    </section>
    <div class="filter-section">
        <div class="container">
            <div class="row">
                <div class="col-12 col-xl-3">
                    <ul class="filter">
                        <li class="filter__goods">
                            <div class="filter__link-block">
                                <a class="filter__link active" href="#" title="{{$category->name}}">{{$category->name}}
                                <span class="filter__amount-block">
                                    <span class="filter__left-bracker">(</span>
                                    <span class="filter__amount">{{$productsCount}}</span>
                                    <span class="filter__right-bracker">)</span>
                                </span>
                                </a>
                            </div>
                        </li>
                        @foreach ($subcats as $subcat)
                            <li class="filter__goods">
                                <div class="filter__link-block">
                                    <a class="filter__link" href="/{{$catalogAlias}}/{{$subcat->getAttribute('path')}}" title="{{$subcat->name}}">{{$subcat->name}}
                                    <span class="filter__amount-block">
                                        <span class="filter__left-bracker">(</span>
                                        <span class="filter__amount">{{$subcat->products_count}}</span>
                                        <span class="filter__right-bracker">)</span>
                                    </span>
                                    </a>
                                </div>
                            </li>
                        @endforeach
                    </ul>
                    @if ($category->parent()->exists() && $products->count() > 0)
                        <section class="selection">
                            <form data-page="1" data-click-count="0" name="filter-form" class="selection__form" action="#" >
                        <h4 class="selection__title">Подбор по параметрам</h4>
                        <div class="selection__wrapper-with-btn">
                        <div class="selection__wrapper">
                            <section class="ui-slider">
                                <div class="ui-slider__mini-title-block">
                                    <h6 class="ui-slider__mini-title">Цена. р.</h6>
                                    <img class="ui-slider__arrow" src="/img/theme/icons/arrow.svg" alt="" role="presentation" />
                                </div>
                                <div class="ui-slider__amounts">
                                    <div class="ui-slider__slider">
                                        <div class="ui-slider__slider-wrapper">
                                            <div class="ui-slider__main-slider" id="slider"></div>
                                        </div>
                                        <div class="ui-slider__input-wrapper">
                                            <span class="ui-slider__from">от</span>
                                            <input name="min_price" class="ui-slider__from-input" placeholder="{{$minPriceSelected}}" maxlength="6" type="text" value="{{$minPriceSelected}}" />
                                            <span class="ui-slider__to">до</span>
                                            <input name="max_price" class="ui-slider__to-input" placeholder="{{$maxPriceSelected}}" maxlength="6"
                                            type="text" value="{{$maxPriceSelected}}" />
                                        </div>
                                    </div>
                                </div>
                            </section>
                            @if (isset($brands) && !empty($brands['items']) && $brands['count'] > 0)
                                <section class="choose"  data-filter-type-id="vendors">
                                    <div class="choose__mini-title-block">
                                        <h6 class="choose__mini-title">Бренды</h6>
                                        <img class="choose__arrow" src="/img/theme/icons/arrow.svg" alt="" role="presentation" />
                                    </div>
                                    <ul class="choose__amounts"  data-page="1" data-click-count="0">
                                        @foreach ($brands['items'] as $brand)
                                            <li class="choose__row">
                                                <label class="choose__label label-checkbox">
                                                    <input class="choose__input label-checkbox__input-hidden" type="checkbox" @if ($brand->checked) checked @endif name="vendors[]" value="{{$brand->vendor_id}}" />
                                                    <span class="choose__check label-checkbox__label-span"></span>
                                                    <span class="choose__brand">{{$brand->name}}</span>
                                                    <span class="choose__amount-block">
                                                            <span class="choose__left-bracker">(</span>
                                                            <span class="choose__amount">{{$brand->products_count}}</span>
                                                            <span class="choose__right-bracker">)</span>
                                                        </span>
                                                </label>
                                            </li>
                                        @endforeach
                                        </ul>
                                        @if ($brands['count'] > 5)
                                            <button class="choose__button choose__filter-button button button-blue show-more" type="button" value="показать еще">показать еще</button>
                                        @endif
                                </section>
                            @endif
                            @if (isset($filter) && !empty($filter['items']) && $filter['count'] > 0)
                                @foreach ($filter['items'] as $filterItem)
                                    <section class="choose" data-filter-type-id="{{$filterItem['id']}}">
                                        <div class="choose__mini-title-block">
                                            <h6 class="choose__mini-title">{{$filterItem['name']}}</h6>
                                            <img class="choose__arrow" src="/img/theme/icons/arrow.svg" alt="" role="presentation" />
                                        </div>
                                        <ul class="choose__amounts" data-page="1" data-click-count="0">
                                            @foreach($filterItem['options']['items'] as $option)
                                                <li class="choose__row">
                                                    <label class="choose__label label-checkbox">
                                                        <input class="choose__input label-checkbox__input-hidden" type="checkbox" @if ($option->checked) checked @endif name="{{$filterItem['slug']}}[]" value="{{$option->filter_option_slug}}" />
                                                        <span class="choose__check label-checkbox__label-span"></span>
                                                        <span class="choose__brand">{{$option->filter_option_name}}</span>
                                                        <span class="choose__amount-block">
                                                            <span class="choose__left-bracker">(</span>
                                                            <span class="choose__amount">{{$option->products_count}}</span>
                                                            <span class="choose__right-bracker">)</span>
                                                        </span>
                                                    </label>
                                                </li>
                                            @endforeach
                                        </ul>
                                        @if ($filterItem['options']['count'] > 5)

                                            <button class="choose__button choose__filter-button button button-blue show-more" type="button" value="показать еще">показать еще</button>

                                        @endif

                                    </section>
                                @endforeach
                            @endif
                        </div>
                        @if ($filter['count'] > 5)
                            <button class="selection__button button button-blue" type="button" value="">ЕЩЕ ПАРАМЕТРЫ +</button>
                        @endif
                        </div>
                        </form>
                        </section>
                    @endif
                </div>
                <div class="col-12 col-xl-9" id="paginationAppend">
                    <div class="sortable">
                        <div class="sortable__left-side">
                            <span class="sortable__sortBy">Сортировать по:</span>

                            @if (\request('sort') == 'price-asc' || \request('sort') == 'price-desc')
                                <a class="sortable__link active" data-sort-by="price" data-sort-direction="{{$priceSort}}" href="#"
                                title="цене">цене <img class="sortable__arrow @if ($priceSort == 'desc') rotate @endif"
                                style="display: inline" src="/img/theme/icons/arrow_blue.svg" alt="" role="presentation">
                                </a>
                            @else
                                <a class="sortable__link" data-sort-by="price" data-sort-direction="{{$priceSort}}" href="#" title="цене">цене
                                    <img class="sortable__arrow" src="/img/theme/icons/arrow_blue.svg" alt="" role="presentation">
                                </a>
                            @endif

                            @if (\request('sort') == 'new-asc' || \request('sort') == 'new-desc')
                                <a class="sortable__link active" data-sort-by="new" data-sort-direction="{{$newSort}}" href="#"
                                title="новизне">новизне <img class="sortable__arrow @if ($newSort == 'desc') rotate @endif"
                                style="display: inline" src="/img/theme/icons/arrow_blue.svg" alt="" role="presentation">
                                </a>
                            @else
                                <a class="sortable__link" data-sort-by="new" data-sort-direction="{{$newSort}}" href="#" title="новизне">новизне
                                    <img class="sortable__arrow" src="/img/theme/icons/arrow_blue.svg" alt="" role="presentation">
                                </a>
                            @endif

                            @if (\request('sort') == 'popular-asc' || \request('sort') == 'popular-desc')
                                <a class="sortable__link active" data-sort-by="popular" data-sort-direction="{{$popularSort}}" href="#"
                               title="популярности">популярности <img class="sortable__arrow @if ($popularSort == 'desc') rotate @endif"
                               style="display: inline" src="/img/theme/icons/arrow_blue.svg" alt="" role="presentation">
                                </a>
                            @else
                                <a class="sortable__link" data-sort-by="popular" data-sort-direction="{{$popularSort}}" href="#" title="популярности">популярности
                                    <img class="sortable__arrow" src="/img/theme/icons/arrow_blue.svg" alt="" role="presentation">
                                </a>
                            @endif
                        </div>
                        <div class="sortable__right-side">
                            <a class="sortable__cards active" href="#" title="таблица">
                                <span class="sortable__lt"></span>
                                <span class="sortable__rt"></span>
                                <span class="sortable__ld"></span>
                                <span class="sortable__rd"></span>
                            </a>
                            <a class="sortable__tables no-active" href="/category-list.html" title="список">
                                <span class="sortable__first"></span>
                                <span class="sortable__second"></span>
                                <span class="sortable__third"></span>
                            </a>
                        </div>
                    </div>
                    <div class="popular light-theme" id="popular">
                        <div class="container">
                            <div class="row" id="catalogRow">
                                @foreach($products as $product)
                                    @if (isset($product->old_price) && !empty($product->old_price))
                                        {{--Товары со скидками--}}
                                        <div class="col-12 col-sm-6 col-md-6 col-lg-4">
                                            <div class="popular__card">
                                                <img class="popular__sale-img" src="/img/theme/icons/persent.png" alt="persent" title="">
                                                <a class="popular__img-link" href="/sales/{{$product->category_url}}" title="{{$product->name}}">
                                                    <img class="popular__img" src="{{$product->image}}" alt="{{$product->name}}" title="{{$product->name}}">
                                                </a>
                                                <div class="popular__reverse-block">
                                                    <a class="popular__img-link-desc" href="/sales/{{$product->category_url}}" title="{{$product->name}}">{{$product->name}}</a>
                                                    <div class="rating">
                                                        <div class="rating__stars-block" style="font-size: 0">
                                                            @for ($i = 0; $i < 5; $i++)
                                                                @if ($i+1 <= $product->avg_rate)
                                                                    <img class="rating__star" src="/img/theme/icons/star_checked.png" alt="" role="presentation" />
                                                                @else
                                                                    <img class="rating__star" src="/img/theme/icons/star_unchecked.png" alt="" role="presentation" />
                                                                @endif
                                                            @endfor
                                                        </div>
                                                        <div class="rating__feed-block">
                                                            <span class="rating__feed-count">{{$product->reviews_count}}</span>
                                                            <span class="rating__feed-title">отзывов</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="popular__reverse-right-block">
                                                    <div class="popular__price-shop discount">
                                                        <span class="popular__from-word">от</span>
                                                            <span class="popular__total-price shop discount">@if (!empty($product->min_price)){{\App\PriceFormat::numberFormatWithSpaces($product->min_price)}}@else 0 @endif</span>
                                                            <span class="popular__old-price"><span class="strike">{{\App\PriceFormat::numberFormatWithSpaces($product->old_price)}}</span>
                                                        </span>
                                                    </div>
                                                    <div class="popular__shops">
                                                        <span class="popular__shop-in">в</span>
                                                        <span class="popular__shop-count"> 1 </span>
                                                        <span class="popular__shop-title">магазинах</span>
                                                    </div>
                                                    <a class="popular__link-shop button button-yellow" href="/sales/{{$product->category_url}}" title="Сравнить цены">Сравнить цены</a>
                                                </div>
                                            </div>
                                        </div>
                                    @else
                                        {{--Товары без скидок--}}
                                        <div class="col-12 col-sm-6 col-md-6 col-lg-4">
                                            <div class="popular__card">
                                                <a class="popular__img-link" href="/catalog/{{$product->category_url}}" title="{{$product->name}}">
                                                    <img class="popular__img" src="{{$product->image}}" alt="{{$product->name}}" title="{{$product->name}}" />
                                                </a>
                                                <div class="popular__reverse-block">
                                                    <a class="popular__img-link-desc" href="/catalog/{{$product->category_url}}" title="{{$product->name}}">{{$product->name}}</a>
                                                    <div class="rating">
                                                        <div class="rating__stars-block" style="font-size: 0">
                                                            @for ($i = 0; $i < 5; $i++)
                                                                @if ($i+1 <= $product->avg_rate)
                                                                    <img class="rating__star" src="/img/theme/icons/star_checked.png" alt="" role="presentation" />
                                                                @else
                                                                    <img class="rating__star" src="/img/theme/icons/star_unchecked.png" alt="" role="presentation" />
                                                                @endif
                                                            @endfor
                                                        </div>
                                                        <div class="rating__feed-block">
                                                            <span class="rating__feed-count">{{$product->reviews_count}}</span>
                                                            <span class="rating__feed-title">отзывов</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="popular__reverse-right-block">
                                                    <div class="popular__price-shop">
                                                        <span class="popular__from-word">от</span>
                                                        <span class="popular__total-price shop">@if (!empty($product->min_price)){{\App\PriceFormat::numberFormatWithSpaces($product->min_price)}}@else 0 @endif</span>
                                                    </div>
                                                    <div class="popular__shops">
                                                        <span class="popular__shop-in">в</span>
                                                        <span class="popular__shop-count">{{$product->shops_count}}</span>
                                                        <span class="popular__shop-title">магазинах</span>
                                                    </div>
                                                    <a class="popular__link-shop button button-yellow" href="/catalog/{{$product->category_url}}" title="Сравнить цены">Сравнить цены</a>
                                                </div>
                                            </div>
                                        </div>
                                    @endif

                                @endforeach
                            </div>
                        </div>
                    </div>
                    {{ $products->links('vendor/pagination/default') }}
                </div>
            </div>
        </div>
    </div>

    <script>
        var categoryId = {{$category->id}};
        var minPrice = {{$minPrice}};
        var maxPrice = {{$maxPrice}};
        var maxPriceSelected = {{$maxPriceSelected}};
        var minPriceSelected = {{$minPriceSelected}};
        var isSales = {{$isSales}};
    </script>

@endsection
