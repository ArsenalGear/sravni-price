<section class="subscribe" id="subscribe">
    <div class="container">
        <div class="row">
            <div class="col-12 col-sm-12 col-md-12 col-lg-6">
                <div class="subscribe__subscribe-social-block">
                    <h3 class="subscribe__title">Подпишись на все лучшие цены от
                        <span class="subscribe__title-shop" id="shop-calc">5 230</span>
                        <span class="subscribe__title-shop-other">интернет-магазинов:</span>
                    </h3>
                </div>
                <form class="subscribe__form" action="/subscribe" method="POST" name="subscribe" id="subscribeForm">
                    <h3 class="subscribe__title-sucsess" id="subscrSuccsess">Вы успешно подписались</h3>
                    <input maxlength="60" class="subscribe__email input-default" required="required" type="email" name="emailaddress" id="email" placeholder="Введите свой e-mail" />
                    <button class="subscribe__btn-subsc button button-yellow" id="sucsessBtn" type="submit" value="подписаться">подписаться</button>
                </form>
                <div class="social-entry">
                    <h4 class="social-entry__title">Через соцсети:</h4>
                    <ul class="social-entry__social-block">
                        <div data-mobile-view="true" data-share-size="40" data-like-text-enable="false" data-background-alpha="0.0" data-pid="1844693" data-mode="share" data-background-color="#ffffff" data-share-shape="round" data-share-counter-size="12" data-icon-color="#ffffff" data-mobile-sn-ids="fb.vk.tw.ok.wh.tm.vb." data-text-color="#000000" data-buttons-color="#FFFFFF" data-counter-background-color="#ffffff" data-share-counter-type="disable" data-orientation="horizontal" data-following-enable="false" data-sn-ids="fb.vk.tw.ok.wh.tm.vb." data-preview-mobile="false" data-selection-enable="true" data-exclude-show-more="false" data-share-style="1" data-counter-background-alpha="1.0" data-top-button="false" class="uptolike-buttons" ></div>
                    </ul>
                </div>
            </div>
            <div class="col-12 col-sm-12 col-md-12 col-lg-6">
                <div class="shop-add">
                    <div class="row">
                        <div class="col-6 col-sm-4 col-md-4 col-lg-4">
                            <a class="shop-add__shop-card" href="#" title="#">
                                <img class="shop-add__img" src="/img/theme/shop/brand.png" alt="#" title="" />
                            </a>
                        </div>
                        <div class="col-6 col-sm-4 col-md-4 col-lg-4">
                            <a class="shop-add__shop-card" href="#" title="#">
                                <img class="shop-add__img" src="/img/theme/shop/brand2.png" alt="#" title="" />
                            </a>
                        </div>
                        <div class="col-6 col-sm-4 col-md-4 col-lg-4">
                            <a class="shop-add__shop-card" href="#" title="#">
                                <img class="shop-add__img" src="/img/theme/shop/brand3.png" alt="#" title="" />
                            </a>
                        </div>
                        <div class="col-6 col-sm-4 col-md-4 col-lg-4">
                            <a class="shop-add__shop-card" href="#" title="#">
                                <img class="shop-add__img" src="/img/theme/shop/brand4.png" alt="#" title="" />
                            </a>
                        </div>
                        <div class="col-6 col-sm-4 col-md-4 col-lg-4">
                            <a class="shop-add__shop-card" href="#" title="#">
                                <img class="shop-add__img" src="/img/theme/shop/brand5.png" alt="#" title="" />
                            </a>
                        </div>
                        <div class="col-6 col-sm-4 col-md-4 col-lg-4">
                            <a class="shop-add__shop-card" href="#" title="#">
                                <img class="shop-add__img" src="/img/theme/shop/brand6.png" alt="#" title="" />
                            </a>
                        </div>
                        <div class="col-6 col-sm-4 col-md-4 col-lg-4">
                            <a class="shop-add__shop-card" href="#" title="#">
                                <img class="shop-add__img" src="/img/theme/shop/brand7.png" alt="#" title="" />
                            </a>
                        </div>
                        <div class="col-6 col-sm-4 col-md-4 col-lg-4">
                            <a class="shop-add__shop-card" href="#" title="#">
                                <img class="shop-add__img" src="/img/theme/shop/brand8.png" alt="#" title="" />
                            </a>
                        </div>
                        <div class="col-6 col-sm-4 col-md-4 col-lg-4">
                            <a class="shop-add__shop-card shop-add__shop-card-no-border" href="#addShop" title="#">
                                <span class="shop-add__add">+</span>
                                <span class="shop-add__add-shop-link">Подключить магазин</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
@if (isset($category) && isset($category->seo_text) && !empty($category->seo_text))
    <section class="service" id="service">
        <div class="container">
            <div class="row">
                {!! $category->seo_text !!}
            </div>
        </div>
    </section>
@endif
</main>
<div class="footer">
    <div class="container">
        <div class="row">
            <ul>
                @if(!empty($menu) && isset($menu))
                    @foreach ($menu as $i => $item)
                        <li>
                            <a class="drop-down__link" href="/{{$item->url}}" title="{{$item->name}}">{{$item->name}}</a>
                        </li>
                    @endforeach
                @endif
            </ul>
        </div>
    </div>
</div>
<div class="sub-footer">
    <div class="container">
        <div class="row">
            <p class="sub-footer__all-rights">© {{\Carbon\Carbon::now()->year}} SravniPrice.ru All rights reserved.</p>
            <a class="sub-footer__add-shop" href="#addShop" title="#">
                <span class="sub-footer__plus">+</span>
                <span class="sub-footer__desc-add-shop">Подключить магазин</span>
            </a>
        </div>
    </div>
</div>
<form class="add-shop popup white-popup-block mfp-hide" action="/feedback" method="POST" id="addShop" autocomplete="off">
    <div class="add-shop__header">
        <h2 class="add-shop__title">Оставить заявку онлайн</h2>
        <div class="add-shop__close-btn">
            <img class="add-shop__close" src="/img/theme/icons/closeModal.svg" alt="закрыть" title="" />
        </div>
    </div>
    <div class="add-shop__body">
        <input maxlength="100" class="add-shop__input-default input-default" id="fio" type="text" name="fio" placeholder="ФИО" required="required" />
        <input maxlength="100" class="add-shop__input-default input-default" id="phone" type="tel" name="tel" placeholder="Телефон" required="required" />
        <input maxlength="100" class="add-shop__input-default input-default" id="eMail" type="email" name="eMail" placeholder="E - mail" required="required" />
        <textarea maxlength="1000" class="add-shop__textarea-default input-default" id="message" rows="7" name="message" placeholder="Сообщение" required="required"></textarea>
        <div class="add-shop__send-block">
            <div class="add-shop__confirm-block">
                <label class="label-checkbox">
                    <input class="label-checkbox__input-hidden" required="required" checked="checked" type="checkbox" id="confirmData" name="confirmData" />
                    <span class="label-checkbox__label-span"></span>
                </label>
                <p>Я соглашаюсь на обработку персональных данных</p>
            </div>
            <button class="add-shop__button button button-yellow" type="submit" value="отправить">отправить</button>
        </div>
    </div>
</form>
<form class="add-shop popup white-popup-block mfp-hide" id="chooseRegion" autocomplete="off">
    <div class="add-shop__header">
        <h2 class="add-shop__title">Выбор города</h2>
        <div class="add-shop__close-btn">
            <img class="add-shop__close" src="/img/theme/icons/closeModal.svg" alt="закрыть" title="" />
        </div>
    </div>
    <div class="add-shop__body">
        <div class="add-shop__row">
            <p class="add-shop__country">Страна:</p>
            <p class="add-shop__country-choose">Россия</p>
        </div>
        <div class="add-shop__row">
            <p class="add-shop__country">Уточнить регион:</p>
            <select class="add-shop__select-country" id="countrySelect" name="country" data-placeholder=""></select>
        </div>
        <div class="add-shop__row">
            <p class="add-shop__country">Выбрать город:</p>
        </div>
        <div class="add-shop__regions-block input-default"></div>
    </div>
</form>
<form class="add-shop popup white-popup-block mfp-hide" id="errorModal" autocomplete="off">
    <div class="add-shop__header">
        <h2 class="add-shop__title">Ошибка!</h2>
        <div class="add-shop__close-btn">
            <img class="add-shop__close" src="/img/theme/icons/closeModal.svg" alt="закрыть" title="" />
        </div>
    </div>
    <div class="add-shop__body">
        <p class="add-shop__thanks-text">Пожалуйста закройте это окно и попробуйте еще раз.</p>
    </div>
</form>
<form class="add-shop popup white-popup-block mfp-hide" id="thanks" autocomplete="off">
    <div class="add-shop__header">
        <h2 class="add-shop__title">Спасибо!</h2>
        <div class="add-shop__close-btn"><img class="add-shop__close" src="/img/theme/icons/closeModal.svg" alt="закрыть" title=""></div>
    </div>
    <div class="add-shop__body">
        <p class="add-shop__thanks-text">Ваша заявка принята. <br> Наш специалист рассмотрит ваше обращение и&nbsp;обязательно свяжется с&nbsp;вами в&nbsp;ближайшее время.</p>
    </div>
</form>

@if (\Request::route()->getName() == 'home')
    <script src="/js/libs-index.min.js"></script>
    <script src="/js/common.min.js"></script>
@elseif (\Request::route()->getName() == 'product')
    <script src="/js/libs-index.min.js"></script>
    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
    <script src="/js/common-good.min.js"></script>
@elseif (\Request::route()->getName() == 'obzory-tovarov')
    <script src="/js/libs-inside.min.js"></script>
    <script src="/js/common-feed.min.js"></script>
@elseif (\Request::route()->getName() == 'obzor')
    <script src="/js/libs-inside.min.js"></script>
    <script src="/js/common-feed.min.js"></script>
@else
    <script src="/js/libs-inside.min.js"></script>
    <script src="/js/ui-cookie-pagination-common-inside.min.js"></script>
<!--    <script src="/js/jq-ui-slider/jquery-ui.min.js"></script>-->
<!--    <script src="/js/js.cookie.min.js"></script>-->
<!--    <script src="/js/pagination.min.js"></script>-->
<!--    <script src="/js/common-inside.min.js"></script>-->
@endif

<script src="/js/social-cities-search-email.min.js"></script>
<!--<script src="/js/social.min.js"></script>-->
<!--<script src="/js/cities.min.js"></script>-->
<!--<script src="/js/search.min.js"></script>-->
<!--<script src="/js/email-notifications.min.js"></script>-->
<script>
    jQuery.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name = "csrf-token"]').attr('content')
        }
    });
</script>
