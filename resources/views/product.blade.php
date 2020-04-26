@extends('layouts.wrapper')

@section('content')
    <main>
        <div class="breadcrumbs">
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        <div class="breadcrumbs__wrapper">
                            @foreach($breadcrumbs as $breadcrumb)
                                <a class="breadcrumbs__link" href="/catalog/{{$breadcrumb['path']}}">{{$breadcrumb['name']}}</a>
                                <span class="breadcrumbs__divider">/</span>
                            @endforeach
                            <span class="breadcrumbs__link breadcrumbs__link-last">{{$product->name}}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <section class="title-goods">
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        {{--<h1 class="title-goods__title">{{$product->name}} в г. {{$city->name_first_form}}</h1>--}}
                        <h1 class="title-goods__title">{{$product->name}}</h1>
                    </div>
                </div>
            </div>
        </section>
        <div class="goods-desc">
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        <ul class="goods-desc__ankchor">
                            @if(isset($hars) && count($hars) > 0)
                                <li><a class="goods-desc__link anchor-link" href="#charac" title="Характеристики">Характеристики</a></li>
                            @endif
                            @if (empty($product->old_price))
                                <li><a class="goods-desc__link anchor-link" href="#price" title="Цены">Цены</a></li>
                            @endif
                            @if (!empty($product->description))
                                <li><a class="goods-desc__link anchor-link" href="#desc" title="Описание">Описание</a></li>
                            @endif
                            <li><a class="goods-desc__link anchor-link" href="#video" title="Видео" >Видео</a></li>
                            <li><a class="goods-desc__link anchor-link" href="#feed" title="Отзывы">Отзывы</a></li>
                            <li><a class="goods-desc__link anchor-link" href="#similar" title="Похожие товары">Похожие товары</a></li>
                        </ul>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12 col-lg-6">
                        <div class="good-slider">
                            <div class="good-slider__slider" id="goodSlider">
                                <div class="good-slider__wrapper"><img src="{{$product->image}}" alt="{{$product->name}}" title="{{$product->name}}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-lg-6">
                        <div class="buy">
                            <div class="buy__rating-block">
                                @if (empty($product->old_price))
                                    {{--Для товара без скидки--}}
                                    <p class="buy__middle-price-desc">Средняя цена</p>
                                @else
                                    {{--Для товара со скидкой--}}
                                    <p class="buy__middle-price-desc">Цена со скидкой</p>
                                @endif
                                <div class="rating">
                                    @for ($i = 0; $i < 5; $i++)
                                        @if ($i+1 <= $product->avg_rate)
                                            <img class="rating__star" src="/img/theme/icons/star_checked.png" alt="" role="presentation" />
                                        @else
                                            <img class="rating__star" src="/img/theme/icons/star_unchecked.png" alt="" role="presentation" />
                                        @endif
                                    @endfor
                                    <div class="rating__feed-block"><span class="rating__feed-count">{{$product->reviews_count}}</span><span class="rating__feed-title">отзывов</span></div>
                                </div>
                            </div>
                            <div class="buy__midle-price-block"><span class="buy__red-price" id="red-price">{{\App\PriceFormat::numberFormatWithSpaces($middlePrice)}}</span>
                                <span class="buy__from">от</span>
                                    <a class="buy__link-shop" onclick="window.open('{{$middleShopUrl}}','_blank');return false;" href="#" title="магазин">{{$middleShop->name}}</a>
                                </div>
                            <div class="buy__price-range-block">
                                @if (empty($product->old_price))
                                    {{--Для товара без скидки--}}
                                    <div class="buy__price-range-wrapper">
                                        <span class="buy__from-word">от</span>
                                        <span class="buy__from-range">{{\App\PriceFormat::numberFormatWithSpaces($minPrice)}}</span>
                                        @if ($shopsCount > 1)
                                            <span class="buy__from-line">-</span>
                                            <span class="buy__to-range">{{\App\PriceFormat::numberFormatWithSpaces($maxPrice)}}</span>
                                        @endif
                                    </div>
                                @else
                                    {{--Для товара со скидкой--}}
                                    <div class="buy__price-range-wrapper">
                                        <span style="color: #f33733; text-decoration: line-through;" class="buy__from-range"><span class="strike">{{\App\PriceFormat::numberFormatWithSpaces($product->old_price)}}</span></span>
                                    </div>
                                @endif
                                <div class="buy__shop-count"><span class="buy__in-word">в</span><span class="buy__inshop-count">{{$shopsCount}}</span><span class="buy__in-word-shop">магазинах</span></div>
                            </div>
                            <div class="buy__btn-block">
                                <a class="buy__buy-btn button button-yellow" onclick="window.open('{{$middleShopUrl}}','_blank');return false;" href="#" title="#">Купить</a>
                                @if (empty($product->old_price))
                                    <a class="buy__match-btn button button-blue anchor-link" href="#price" title="#">Сравнить</a>
                                @endif
                            </div>
                            <div class="buy__charac-block">
                                @if (isset($product->vendor->name) && !empty($product->vendor->name))
                                    <div class="buy__charac-row"><span class="buy__charac-key">производитель:</span><span class="buy__charac-value">{{$product->vendor->name}}</span></div>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
                @if(isset($hars) && count($hars) > 0)
                    <section class="characteristic" id="charac">
                        <div class="characteristic__title-block">
                            <h3 class="characteristic__title">Характеристики {{$product->name}}</h3>
                            <div class="characteristic__invisible-rotate-block"></div>
                        </div>
                        <div class="characteristic__table-wrapper">
                            <table class="characteristic__table" id="charac-table">
                                @foreach($hars as $har)
                                    <tr>
                                        <td class="characteristic__key">{{$har->filter_type_name}}</td>
                                        <td class="characteristic__value">{{$har->filter_option_name}}</td>
                                    </tr>
                                @endforeach
                            </table>
                        </div>
                    </section>
                @endif
                @if(isset($product->description) && !empty($product->description))
                    <section class="describe" id="desc">
                        <div class="describe__title-block">
                            <h3 class="describe__title">Описание</h3>
                            <div class="describe__invisible-rotate-block"></div>
                        </div>
                        <div class="describe__desc-block">
                           <p>{{$product->description}}</p>
                        </div>
                    </section>
                @endif
                <section class="video" id="video" style="display: none">
                    <div class="video__title-block">
                        <h3 class="video__title">Видеообзор</h3>
                        <div class="video__invisible-rotate-block"></div>
                    </div>
                    <div class="video__video-block"></div>
                </section>
                @if (empty($product->old_price))
                    {{--Для товара без скидок--}}
                    <section class="price-block" id="price">
                    <div class="price-block__title-block">
                        <h3 class="price-block__title">Цены на {{$product->name}} в г. {{$city->name_first_form}}</h3>
                        <div class="price-block__invisible-rotate-block"></div>
                    </div>
                    @for($i=0; $i < 5; $i++)
                        @if ($i < count($resultShopsList))
                            <div class="row">
                                <div class="col-12 col-md-6">
                                    <div class="brand-block">
                                        <div class="brand-block__shop-block"><img class="brand-block__img" src="/storage/{{$resultShopsList[$i]['logo_img']}}" alt="#" title="#" /></div>
                                        <div class="brand-block__desc-block">
                                            @if (isset($resultShopsList[$i]['pivot']['price']))
                                                <a class="brand-block__model" href="#" @if(isset($resultShopsList[$i]['shop_url'])) onclick="window.open('{{$resultShopsList[$i]['shop_url']}}','_blank');return false;" @endif title="#">{{$resultShopsList[$i]['name']}}</a>
                                            @else
                                                <a class="brand-block__model" href="#" @if(isset($resultShopsList[$i]['shop_search_url'])) onclick="window.open('{{$resultShopsList[$i]['shop_search_url']}}','_blank');return false;" @endif title="#">Посмотреть цены</a>
                                            @endif
                                            {{--<div class="brand-block__charac-block"><span class="brand-block__single-charac">intel i5</span><span class="brand-block__slash">/</span><span class="brand-block__single-charac">8 Гб</span><span class="brand-block__slash">/</span><span class="brand-block__single-charac">Windows 10</span></div>--}}
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-6">
                                    <div class="silo">
                                        <div class="silo__silo-block">
                                            <div class="silo__silo-title">Есть на складе</div>
                                            <div class="silo__silo-town">по {{$city->name_second_form}}</div>
                                        </div>
                                        <div class="silo__price-wrap">
                                            @if (isset($resultShopsList[$i]['pivot']['price']))
                                                <p class="silo__cost">{{\App\PriceFormat::numberFormatWithSpaces($resultShopsList[$i]['pivot']['price'])}}</p>
                                                <a class="silo__link button button-yellow" href="#" @if(isset($resultShopsList[$i]['shop_url'])) onclick="window.open('{{$resultShopsList[$i]['shop_url']}}','_blank');return false;" @endif title="#">в Магазин</a>
                                            @else
                                                <a class="silo__link button button-yellow" href="#" @if(isset($resultShopsList[$i]['shop_search_url'])) onclick="window.open('{{$resultShopsList[$i]['shop_search_url']}}','_blank');return false;" @endif title="#">в Магазин</a>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            </div>
                        @endif
                    @endfor
                    @if (count($resultShopsList) > 5)
                        <button class="price-block__button button button-blue show-more" type="button" value="все предложения">все предложения</button>
                        <div class="price-block__shop-count"><span class="price-block__in">в</span><span class="price-block__count">{{count($resultShopsList)}}</span><span class="price-block__shop-word">магазинах</span></div>
                        @for($i=5; $i < count($resultShopsList); $i++)
                            <div class="row" style="display:none;">
                                <div class="col-12 col-md-6">
                                    <div class="brand-block">
                                        <div class="brand-block__shop-block"><img class="brand-block__img" src="/storage/{{$resultShopsList[$i]['logo_img']}}" alt="#" title="#" /></div>
                                        <div class="brand-block__desc-block">
                                            @if (isset($resultShopsList[$i]['pivot']['price']))
                                                <a class="brand-block__model" href="#" @if(isset($resultShopsList[$i]['shop_url'])) onclick="window.open('{{$resultShopsList[$i]['shop_url']}}','_blank');return false;" @endif title="#">{{$resultShopsList[$i]['name']}}</a>
                                            @else
                                                <a class="brand-block__model" href="#" @if(isset($resultShopsList[$i]['shop_search_url'])) onclick="window.open('{{$resultShopsList[$i]['shop_search_url']}}','_blank');return false;" @endif title="#">Посмотреть цены</a>
                                            @endif
                                            {{--<div class="brand-block__charac-block"><span class="brand-block__single-charac">intel i5</span><span class="brand-block__slash">/</span><span class="brand-block__single-charac">8 Гб</span><span class="brand-block__slash">/</span><span class="brand-block__single-charac">Windows 10</span></div>--}}
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-6">
                                    <div class="silo">
                                        <div class="silo__silo-block">
                                            <div class="silo__silo-title">Есть на складе</div>
                                            <div class="silo__silo-town">по {{$city->name_second_form}}</div>
                                        </div>
                                        <div class="silo__price-wrap">
                                            @if (isset($resultShopsList[$i]['pivot']['price']))
                                                <p class="silo__cost">{{\App\PriceFormat::numberFormatWithSpaces($resultShopsList[$i]['pivot']['price'])}}</p>
                                                <a class="silo__link button button-yellow" href="#" @if(isset($resultShopsList[$i]['shop_url'])) onclick="window.open('{{$resultShopsList[$i]['shop_url']}}','_blank');return false;" @endif title="#">в Магазин</a>
                                            @else
                                                <a class="silo__link button button-yellow" href="#" @if(isset($resultShopsList[$i]['shop_search_url'])) onclick="window.open('{{$resultShopsList[$i]['shop_search_url']}}','_blank');return false;" @endif title="#">в Магазин</a>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            </div>
                        @endfor
                    @endif
                </section>
                @endif
                <section class="feed" id="feed">
                    <div class="feed__title-block">
                        <h3 class="feed__title">Отзывы о ноутбук Dell Inspiron 5570</h3>
                        <div class="feed__invisible-rotate-block"></div>
                    </div>
                    <div class="feed__add-feed-block">
                        <div class="feed__feed-count"><span class="feed__count">{{$product->reviews_count}}</span><span class="feed__word">отзывов</span></div>
                        <div class="feed__add-feed"><a class="feed__add-word anchor-link" href="#addFeed" title="#">+ Добавить отзыв</a></div>
                    </div>
                    <div class="feed__wrapper">
                        @foreach ($reviews as $review)
                            <div class="feed-card">
                                <div class="row">
                                    <div class="col-12 col-md-4">
                                        <div class="feed-card__name-n-date">
                                            <p class="feed-card__name">@if (!empty($review->name)){{$review->name}}@else Гость @endif</p><span class="feed-card__divide">|</span>
                                            <p class="feed-card__time"><time> {{$review->time}} </time></p>
                                        </div>
                                        <div class="feed-card__mark-block">
                                            <p class="feed-card__mark-word">Оценка</p>
                                            <div class="feed-card__mark-wrap"><span class="feed-card__mark">{{$review->rate}}</span>
                                                <div class="rating">
                                                    <div class="rating__stars-block" style="font-size: 0">
                                                        @for ($i = 0; $i < 5; $i++)
                                                            @if ($i+1 <= $review->rate)
                                                                <img class="rating__star" src="/img/theme/icons/star_checked.png" alt="" role="presentation" />
                                                            @else
                                                                <img class="rating__star" src="/img/theme/icons/star_unchecked.png" alt="" role="presentation" />
                                                            @endif
                                                        @endfor
                                                    </div>
                                                    <p class="rating__choice-title">{{$review->rate_title}}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-12 col-md-8">
                                        @if ($review->recommended)
                                            <p class="feed-card__recommend-accept">Реккомендую покупку</p>
                                        @else
                                            <p class="feed-card__recommend-reject">Не реккомендую покупку</p>
                                        @endif
                                        @if (!empty($review->comment))
                                            <p class="feed-card__reccomend-desc">{{$review->comment}}</p>
                                        @endif
                                    </div>
                                    <div class="feed-card__bottom-block">
                                        <div class="col-12 col-xl-4 order-xl-1 order-lg-2 order-md-2 order-sm-2 order-2">
                                            <div class="feed-card__useful-block">Полезен ли отзыв? <p class="feed-card__useful-title"></p>
                                                <div class="feed-card__useful-btn-block"><label class="feed-card__useful-btn button active"><input class="feed-card__usefull-input usefull-btn" type="radio" checked="checked" name="feed1" /><span class="feed-card__useful-span">Да</span></label><label class="feed-card__useful-btn button"><input class="feed-card__usefull-input not-usefull-btn" type="radio" name="feed2" /><span class="feed-card__useful-span">Нет</span></label></div>
                                            </div>
                                        </div>
                                        <div class="col-12 col-xl-8 d-flex flex-wrap align-items-center order-xl-2 order-lg-1 order-md-1 order-sm-1 order-1">
                                            <div class="feed-card__liked-row"><span class="feed-card__liked-status">Понравилось</span>
                                                <p class="feed-card__liked-desc">{{$review->advantages}}</p>
                                            </div>
                                            <div class="feed-card__liked-row"><span class="feed-card__disliked-status">Не понравилось</span>
                                                <p class="feed-card__liked-desc">{{$review->limitations}}</p>
                                            </div>
                                            @if (!empty($review->experience_of_using))
                                                <div class="feed-card__liked-row"><span class="feed-card__exp-status">Опыт использования</span>
                                                    <p class="feed-card__liked-desc">{{$review->experience_of_using}}</p>
                                                </div>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </section>
                {{ $reviews->links('vendor/pagination/default') }}
                <section class="add-feed">
                    <div class="row justify-content-center">
                        <div class="col-12 col-xl-8">
                            <form id="addFeed">
                                <div class="add-feed__add-feed-block">
                                    <h2 class="add-feed__title">Добавить отзыв</h2>
                                    <div class="add-feed__row">
                                        <span class="add-feed__form-title">Ваше имя:</span>
                                        <input maxlength="150" class="add-feed__input" name="name" type="text" placeholder="Ваше имя" />
                                    </div>
                                    <div class="add-feed__row">
                                        <span class="add-feed__form-title star">Понравилось:</span>
                                        <textarea maxlength="1000" class="add-feed__textarea" name="advantages" rows="5" required="required" placeholder="Плюсы товара"></textarea>
                                    </div>
                                    <div class="add-feed__row">
                                        <span class="add-feed__form-title star"> Не понравилось:</span>
                                        <textarea maxlength="1000" class="add-feed__textarea" name="limitations" rows="5" required="required" placeholder="Недостатки товара"></textarea>
                                    </div>
                                    <div class="add-feed__row">
                                        <span class="add-feed__form-title">Комментарий:</span>
                                        <textarea maxlength="2000" class="add-feed__textarea" name="comment" rows="5" placeholder="Ваш комментарий"></textarea>
                                    </div>
                                    <div class="add-feed__row">
                                        <span class="add-feed__form-title">Опыт использования:</span>
                                        <input maxlength="100" class="add-feed__input" name="experience_of_using" type="text" placeholder="Введите срок" />
                                    </div>
                                </div>
                                <div class="add-feed__rate-block">
                                    <div class="row">
                                        <div class="col-12 col-lg-6">
                                            <div class="add-feed__rating-block">
                                                <div class="add-feed__main-rate"><span class="add-feed__rate-this">Оценить</span>
                                                    <div class="add-feed__rate-container">
                                                        <div class="rating-container">
                                                            <img id="firstStar" data-rating="1" data-feed="Очень плохо" class="add-feed__star one-star rating-star rating-chosen" src="/img/theme/icons/star_checked.png" alt="" role="presentation" />
                                                            <img id="sedondStar" data-rating="2" data-feed="Так себе" class="add-feed__star two-star rating-star rating-chosen" src="/img/theme/icons/star_checked.png" alt="" role="presentation" />
                                                            <img id="thirdStar" data-rating="3" data-feed="Удовлетворительно" class="add-feed__star three-star rating-star rating-chosen" src="/img/theme/icons/star_checked.png" alt="" role="presentation" />
                                                            <img id="fourthStar" data-rating="4" data-feed="Похвально" class="add-feed__star four-star rating-star rating-chosen" src="/img/theme/icons/star_checked.png" alt="" role="presentation" />
                                                            <img id="fifthStar" data-rating="5" data-feed="Отлично" class="add-feed__star five-star rating-star rating-chosen" src="/img/theme/icons/star_checked.png" alt="" role="presentation" />
                                                        </div>
                                                        <div class="new-modal__meaning-block consult-feed__meaning-block">
                                                            <div class="new-modal__meaning meaning" style="display: none;"></div>
                                                        </div>
                                                    </div>
                                                    <div class="add-feed__mark-block">
                                                        <span class="add-feed__mark" id="mark">5</span>
                                                        <input name="rate" type="hidden" id="rate" value="5">
                                                    </div>
                                                </div>
                                                <p class="add-feed__rate-this">Рекомендуете ли вы этот товар другим покупателям?</p>
                                                <div class="add-feed__rate-this-block"><label class="add-feed__rate-label"><input value="1" id="rateYes" name="recommended" type="radio" checked="checked" /><span class="add-feed__span-outside"><span class="add-feed__span-inside"></span></span><span class="add-feed__useful-span">Да</span></label><label class="add-feed__rate-label"><input value="0" id="rateNo" name="recommended" type="radio" /><span class="add-feed__span-outside"><span class="add-feed__span-inside"></span></span><span class="add-feed__useful-span">Нет</span></label></div>
                                            </div>
                                        </div>
                                        <div class="col-6 col-xl-6">
                                            <div class="g-recaptcha" data-sitekey="6LfinKkUAAAAAMq4Pryh3OigRDY9SpWt6W0uj2ta"></div>
                                            <div class="text-danger" id="recaptchaError"></div>
                                        </div>
                                        <div class="col-12 col-lg-6">
                                            <div class="add-feed__send-block"><button class="add-feed__btn button button-blue" type="submit" value="Отправить">Отправить</button></div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
                @if (isset($similarPoducts) && $similarPoducts->count() > 0)
                    <section class="similar-goods" id="similar">
                        <div class="similar-goods__title-block">
                            <h3 class="similar-goods__title">Похожие товары</h3>
                            <div class="similar-goods__invisible-rotate-block"></div>
                        </div>
                        <div class="popular">
                            <div class="row" id="popular-slider">
                                @foreach ($similarPoducts as $similarPoduct)
                                    <div class="popular__card">
                                        <!--+e('img').heart(src="/img/theme/icons/Heart.png" alt="heart")-->
                                        <a class="popular__img-link" href="/catalog/{{$similarPoduct->category_url}}" title="{{$similarPoduct->name}}">
                                            <img class="popular__img" src="{{$similarPoduct->image}}" alt="{{$similarPoduct->name}}" title="{{$similarPoduct->name}}" />
                                        </a>
                                        <a class="popular__img-link-desc" href="/catalog/{{$similarPoduct->category_url}}" title="{{$similarPoduct->name}}">{{$similarPoduct->name}}</a>
                                        <a class="popular__price button button-yellow" href="/catalog/{{$similarPoduct->category_url}}" title="{{$similarPoduct->name}}">от<span class="popular__total-price">{{\App\PriceFormat::numberFormatWithSpaces($similarPoduct->min_price)}}</span></a>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    </section>
                @endif
            </div>
        </div>
        <div id="toTop">Наверх</div>
        <script>
            var productId = "{{$product->id}}";
        </script>
    </main>
@endsection
