$(function () {

    //Подмена и добавление параметров в url функция превращает параметры url в json объект. Аргументом получает параметры в виде строки параметров url (window.location.search или serialized)
    function getQueryParams(uri) {
        function identity(e) {
            return e;
        }

        function toKeyValue(params, param) {
            var keyValue = param.split('=');
            var key = keyValue[0], value = keyValue[1];

            params[key] = params[key] ? [value].concat(params[key]) : value;
            return params;
        }

        return decodeURIComponent(uri).replace(/^\?/, '').split('&').filter(identity).reduce(toKeyValue, {});
    }

    //превращает json в url
    function objToQuery(obj) {
        var parts = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
            }
        }
        return "?" + parts.join('&');
    }

    function paginationAjax(serializePage) {

        //Для страницы поиска
        if (getQueryParams(window.location.search).hasOwnProperty('query')) {
            serializePage = serializePage + '&query=' + getQueryParams(window.location.search).query
        }
        if (getQueryParams(window.location.search).hasOwnProperty('sort')) {
            serializePage = serializePage + '&sort=' + getQueryParams(window.location.search).sort
        }

        $('.overlay-filter').show();
        //$('body,html').animate({scrollTop:0},800);

        oldParams = getQueryParams(window.location.search); //старые параметры из url превращаем в json
        newParams = getQueryParams(serializePage); //новые параметры из фильра (serialize) превращаем в json
        //resParams = $.extend(oldParams, newParams); // объединяем оба json'а, при этом если значение там есть, оно переписывается, если нет - добавляется
        newQuery = objToQuery(newParams); //конвертируем полученный json в url строку

        //отладка
   /*         console.log('old: ' + JSON.stringify(oldParams));
            console.log('new: ' + JSON.stringify(newParams));
            //console.log('res: ' + JSON.stringify(resParams));
            console.log('new query: ' + JSON.stringify(newQuery));*/

        window.history.pushState('', '', newQuery); //обновляем адресную строку браузера

        $.ajax({

            type: "POST",
            url: location.origin + location.pathname,
            data: serializePage,
            success: data => {
                
                $('#catalogRow').html('');
                $('.pagination').remove();
                $('#paginationAppend').append(data.pagination);

                for (var i = 0; i < data.items.length; i++) {
                    let transfer = getCardHtml(data.items[i].image_url, data.items[i].name, data.items[i].min_price, data.items[i].shops_count, data.items[i].category_url, data.items[i].reviews_count, data.items[i].avg_rate, data.items[i].old_price);
                    $('#catalogRow').append(transfer);
                }

                $('.overlay-filter').hide();
            }
        });
    };

    $('.sortable__link').click(function (e) {
        e.preventDefault();
        var sortBy = $(this).attr('data-sort-by');
        var sortDirection= $(this).attr('data-sort-direction');

        $(this).find('.sortable__arrow').show();
        $('.sortable__link.active').removeClass('active').find('.sortable__arrow').hide().removeClass('rotate');
        $(this).addClass('active').find('.sortable__arrow').show();

        var params = getQueryParams(window.location.search); //старые параметры из url превращаем в json

        switch (sortDirection) {
            case "asc":
                $(this).attr('data-sort-direction', 'desc');
                params['sort'] = sortBy + '-desc';
                $(this).find('.sortable__arrow').addClass('rotate');
            break;
            case "desc":
                $(this).attr('data-sort-direction', 'asc');
                params['sort'] = sortBy + '-asc';
                $(this).find('.sortable__arrow').removeClass('rotate');
            break;
        }

        newQuery = objToQuery(params);
        window.history.pushState('', '', newQuery);
        var serializePage = $('.selection__form').serialize();
        paginationAjax(serializePage);
    });

    //клик по стрелке "вправо" в панинации
    $('body').on('click', '.pagination__arrow-right', function (e) {

        if ($('body').find('.pagination__arrow-right').prev('.pagination__item').hasClass('active')) {

            e.preventDefault();
        } else {

            e.preventDefault();

            var page = $('.pagination').find('.pagination__item.active span').text();

            page = parseInt(page) + 1;

            var serializePage = $('.selection__form').serialize() + '&page=' + page;

            paginationAjax(serializePage);

            $('body,html').animate({scrollTop:0},800);
        }
    });

    //клик по стрелке "влево" в панинации
    $('body').on('click', '.pagination__arrow-left', function (e) {

        if ($('body').find('.pagination__arrow-left').next('.pagination__item').hasClass('active')) {

            e.preventDefault();
        } else {

            e.preventDefault();

            var page = $('.pagination').find('.pagination__item.active span').text();

            page = parseInt(page) - 1;

            var serializePage = $('.selection__form').serialize() + '&page=' + page;

            paginationAjax(serializePage);

            $('body,html').animate({scrollTop:0},800);
        }
    });

    //клик по цифре пагинации
    $('body').on('click', '.pagination__link', function (e) {

        e.preventDefault();

        var page = $(this).find('span').text();

        var serializePage = $('.selection__form').serialize() + '&page=' + page;

        paginationAjax(serializePage);

        $('body,html').animate({scrollTop:0},800);
    });

    //применить опцию одного фильтра
    $('body').on('click', '.choose__label', function (e) {

        e.preventDefault();

        if ($(this).find('input').prop('checked') == true) {

            $(this).find('input').prop('checked', false);
        } else {

            $(this).find('input').prop('checked', true);
        }

        var tempCheck = $('.filter-section').find('input:checked').length;

        var page = $(this).find('input').attr("name");

        var serializePage = $('.selection__form').serialize();

        paginationAjax(serializePage);
    });

    //показать больше опций фильтра
    $('body').on('click', '.show-more', function(e) {

        e.preventDefault();
        let filterTypeId = $(this).closest('.choose').data('filter-type-id'); //получаем id типа фильтра, для которого нужно получить опции

        var clickCount = $(this).closest('.choose').find('.choose__amounts').attr('data-click-count');
        clickCount++;
        $(this).closest('.choose').find('.choose__amounts').attr('data-click-count', clickCount);

        var page = parseInt($(this).closest('.choose').find('.choose__amounts').attr('data-page'));
        page++;
        $(this).closest('.choose').find('.choose__amounts').attr('data-page', page);

        var name = $(this).closest('.choose').find('input').attr("name");
        // var value = $(this).closest('.choose').find('input').val();

        let limit = 5;

            $.ajax({

                type: "POST",
                url: "/get-more-options/" + categoryId,
                data: {
                    'filter-type-id': filterTypeId,
                    'limit' : limit, //кол-во необходимых опций
                    'page': page, //если page=1 выводим опции от 0 до 5. Если page=2 выводим опции от 6 до 10 и т.д. (если limit=5)
                    'isSales' : isSales, //Для страниц со скидками true, иначе false
                },
                success: data => {

                    var dataCountFilteroptions = data.count;

                    if ( $(this).closest('.choose').data('filter-type-id') == 'vendors') {

                        for (var i = 0; i < data.items.length; i++) {
                            let transfer = getFilterOptions(name, data.items[i].vendor_id, data.items[i].name, data.items[i].products_count, filterTypeId );
                            $("[data-filter-type-id='"+filterTypeId+"']").find('.choose__amounts').append(transfer);
                        }
                    } else {

                        for (var i = 0; i < data.items.length; i++) {
                            let transfer = getFilterOptions(name, data.items[i].filter_option_slug, data.items[i].filter_option_name, data.items[i].products_count, filterTypeId );
                            $("[data-filter-type-id='"+filterTypeId+"']").find('.choose__amounts').append(transfer);
                        }
                    };


                    if ( clickCount >= 3 ) {

                        $(this).removeClass('choose__filter-button');
                    }

                    if ( (limit * (clickCount+1)) >= data.count) {

                        $(this).removeClass('choose__filter-button');
                    }
                }
            });
    });

    $( "#slider" ).on( "slidechange", function( event, ui ) {

        var serializePage = $('.selection__form').serialize();

        paginationAjax(serializePage);
    } );

    //слайдер цены в фильтре
    if ($('#slider').length > 0) { //проверка на существование слайдера
        $("#slider").slider({
            range: true,
            min: minPrice,
            max: maxPrice,
            values: [minPriceSelected, maxPriceSelected],
            slide: function(event, ui) {
                $(".ui-slider__from-input").val(ui.values[0]);
                $(".ui-slider__to-input").val(ui.values[1]);
            }
        });
    }

    //начальное значение цены в слайдере цены
    $(".ui-slider__from-input").change(function () {
        var value = $(this).val();
        
        $("#slider").slider("values", 0, value);
    });

    //конечное значение цены в слайдере цены
    $(".ui-slider__to-input").change(function () {
        var value = $(this).val();
        $("#slider").slider("values", 1, value);
    });

    //показать больше фильтров
    $('body').on('click', '.selection__button', function(e) {

        e.preventDefault();

        var clickCount = parseInt($(this).closest('.selection__form').attr('data-click-count'));
        clickCount++;
        $(this).closest('.selection__form').attr('data-click-count', clickCount);

        var page = parseInt($(this).closest('.selection__form').attr('data-page'));
        page++;
        $(this).closest('.selection__form').attr('data-page', page);

        let limit = 5;

        $.ajax({

            type: "POST",
            url: "/get-more-filters/" + categoryId,
            data: {
                'limit' : limit, //кол-во необходимых типов фильтра
                'page': page, //если page=1 выводим типы фильтра от 0 до 5. Если page=2 выводим типы фильтра от 6 до 10 и т.д. (если limit=5)
                'isSales' : isSales, //Для страниц со скидками true, иначе false
            },
            success: data => {

                var dataCountFilters = data.count;

                if ( clickCount >= 4 ) {

                    $(this).hide();
                }

                if ( (limit * (clickCount+1)) > data.count) {

                    $(this).hide();
                }
                filterTypesHtml = "";
                for (var i = 0; i < data.items.length; i++) {

                    filterTypesHtml = filterTypesHtml + getFiltersTypeHtml(data.items[i]);
                }

                $(".selection__wrapper").append(filterTypesHtml);
            }
        });
    });

    //функция сборки фильтров
    function getFiltersTypeHtml(item) {
        var filterOptionsHtml = "";
        item.options.items.forEach(function (optionItem) {
            filterOptionsHtml = filterOptionsHtml + getFilterOptions(item.slug + "[]", optionItem.filter_option_slug, optionItem.filter_option_name, optionItem.products_count);
        });

        var transfer = '<section class="choose" data-filter-type-id="' + item.id + '">\n' +
                '        <div class="choose__mini-title-block">\n' +
                '            <h6 class="choose__mini-title">' + item.name + '</h6>\n' +
                '            <img class="choose__arrow" src="/img/theme/icons/arrow.svg" alt="" role="presentation" />\n' +
                '        </div>' +
                '<ul class="choose__amounts" data-page="1" data-click-count="0">'
                    + filterOptionsHtml +
                '</ul>' +
                '<button  class="choose__button choose__filter-button button button-blue show-more" type="button" value="показать еще">показать еще</button>\n' +
                '    </section>';

        return transfer;
        //$(".selection__wrapper").append(transfer);
    }

    //функция сборки опций у фильтра
    function getFilterOptions (name, value, option_name, products_count, filterTypeId) {
        var transfer = '<li class="choose__row">\n' +
            '        <label class="choose__label label-checkbox">\n' +
            '            <input class="choose__input label-checkbox__input-hidden" type="checkbox" name="'+ name +'" value="'+ value +'" />\n' +
            '            <span class="choose__check label-checkbox__label-span"></span>\n' +
            '            <span class="choose__brand">'+ option_name +'</span>\n' +
            '            <span class="choose__amount-block">\n' +
            '                <span class="choose__left-bracker">(</span>\n' +
            '                <span class="choose__amount">'+ products_count +'</span>\n' +
            '                <span class="choose__right-bracker">)</span>\n' +
            '            </span>\n' +
            '        </label>\n' +
            '    </li>';

        return transfer;
    }

    //функция сборки карточки товара
    function getCardHtml(image_url, name, min_price, shops_count, min_price_shop_url, reviews_count, avg_rate, old_price=false) {
        if (old_price) {
            var transfer = getSalesCardHtml(image_url, name, min_price, 1, min_price_shop_url, reviews_count, avg_rate, old_price);
            $('#catalogRow').append(transfer);
        } else {
            var transfer = getSimpleCardHtml(image_url, name, min_price, shops_count, min_price_shop_url, reviews_count, avg_rate);
            $('#catalogRow').append(transfer);
        }
    }

    function getSimpleCardHtml(image_url, name, min_price, shops_count, min_price_shop_url, reviews_count, avg_rate, old_price=false) {
        //Форматирование цен
        min_price = numberFormatWithSpaces(min_price);
        if (old_price) {
            old_price = numberFormatWithSpaces(old_price);
        }

        if ($('.sortable__tables').hasClass('active')) {

            var transfer = '<div class="col-12">\n' +
                '                                        <div class="popular__card reverse-card">\n' +
                '                                            <a class="popular__img-link" href="/catalog/' + min_price_shop_url + '" title="">\n' +
                '                                                <img class="popular__img" src="' + JSON.parse(image_url) + '" alt="' + name + '" title="' + name + '" />\n' +
                '                                            </a>\n' +
                '                                            <div class="popular__reverse-block">\n' +
                '                                                <a class="popular__img-link-desc" href="/catalog/' + min_price_shop_url + '" title="' + name + '">' + name + '</a>\n' +
                '                                                <div class="rating">\n' +
                '                                                    <div class="rating__stars-block" style="font-size: 0">\n';

            for ($i = 0; $i < 5; $i++) {
                if ($i+1 <= avg_rate) {
                    transfer += '<img class="rating__star" src="/img/theme/icons/star_checked.png" alt="" role="presentation" />';
                } else {
                    transfer += '<img class="rating__star" src="/img/theme/icons/star_unchecked.png" alt="" role="presentation" />';
                }
            }

            transfer +=
                '                                                    </div>\n' +
                '                                                    <div class="rating__feed-block">\n' +
                '                                                        <span class="rating__feed-count">' + reviews_count + '</span>\n' +
                '                                                        <span class="rating__feed-title">отзывов</span>\n' +
                '                                                    </div>\n' +
                '                                                </div>\n' +
                '                                            </div>\n' +
                '                                            <div class="popular__reverse-right-block">\n' +
                '                                                <div class="popular__price-shop">\n' +
                '                                                    <span class="popular__from-word">от</span>\n' +
                '                                                    <span class="popular__total-price shop">' + min_price + '</span>\n' +
                '                                                </div>\n' +
                '                                                <div class="popular__shops">\n' +
                '                                                    <span class="popular__shop-in">в</span>\n' +
                '                                                    <span class="popular__shop-count">' + shops_count + '</span>\n' +
                '                                                    <span class="popular__shop-title">магазинах</span>\n' +
                '                                                </div>\n' +
                '                                                <a class="popular__link-shop button button-yellow" href="/catalog/' + min_price_shop_url + '" title="Сравнить цены">Сравнить цены</a>\n' +
                '                                            </div>\n' +
                '                                        </div>\n' +
                '                                    </div>';
        }

        else if ($('.sortable__cards').hasClass('active')) {

            var transfer = '<div class="col-12 col-sm-6 col-md-6 col-lg-4">\n' +
                '                                        <div class="popular__card">\n' +
                '                                            <a class="popular__img-link" href="/catalog/' + min_price_shop_url + '" title="">\n' +
                '                                                <img class="popular__img" src="' + JSON.parse(image_url) + '" alt="' + name + '" title="' + name + '" />\n' +
                '                                            </a>\n' +
                '                                            <div class="popular__reverse-block">\n' +
                '                                                <a class="popular__img-link-desc" href="/catalog/' + min_price_shop_url + '" title="' + name + '">' + name + '</a>\n' +
                '                                                <div class="rating">\n' +
                '                                                    <div class="rating__stars-block" style="font-size: 0">\n';
            for ($i = 0; $i < 5; $i++) {
                if ($i+1 <= avg_rate) {
                    transfer += '<img class="rating__star" src="/img/theme/icons/star_checked.png" alt="" role="presentation" />';
                } else {
                    transfer += '<img class="rating__star" src="/img/theme/icons/star_unchecked.png" alt="" role="presentation" />';
                }
            }
            transfer +=
                '                                                    </div>\n' +
                '                                                    <div class="rating__feed-block">\n' +
                '                                                        <span class="rating__feed-count">' + reviews_count + '</span>\n' +
                '                                                        <span class="rating__feed-title">отзывов</span>\n' +
                '                                                    </div>\n' +
                '                                                </div>\n' +
                '                                            </div>\n' +
                '                                            <div class="popular__reverse-right-block">\n' +
                '                                                <div class="popular__price-shop">\n' +
                '                                                    <span class="popular__from-word">от</span>\n' +
                '                                                    <span class="popular__total-price shop">' + min_price + '</span>\n' +
                '                                                </div>\n' +
                '                                                <div class="popular__shops">\n' +
                '                                                    <span class="popular__shop-in">в</span>\n' +
                '                                                    <span class="popular__shop-count">' + shops_count + '</span>\n' +
                '                                                    <span class="popular__shop-title">магазинах</span>\n' +
                '                                                </div>\n' +
                '                                                <a class="popular__link-shop button button-yellow" href="/catalog/' + min_price_shop_url + '" title="Сравнить цены">Сравнить цены</a>\n' +
                '                                            </div>\n' +
                '                                        </div>\n' +
                '                                    </div>';
        }

        return transfer;
    }

    function getSalesCardHtml(image_url, name, min_price, shops_count, min_price_shop_url, reviews_count, avg_rate, old_price) {

        //Форматирование цен
        min_price = numberFormatWithSpaces(min_price);
        if (old_price) {
            old_price = numberFormatWithSpaces(old_price);
        }

        if ($('.sortable__tables').hasClass('active')) {

            var transfer = '<div class="col-12">\n' +
                '                                            <div class="popular__card reverse-card">\n' +
                '                                                <img class="popular__sale-img" src="/img/theme/icons/persent.png" alt="persent" title="">\n' +
                '                                                <a class="popular__img-link" href="/sales/' + min_price_shop_url + '" title="' + name + '">\n' +
                '                                                    <img class="popular__img" src="' + JSON.parse(image_url) + '" alt="' + name + '" title="' + name + '">\n' +
                '                                                </a>\n' +
                '                                                <div class="popular__reverse-block">\n' +
                '                                                    <a class="popular__img-link-desc" href="/sales/' + min_price_shop_url + '" title="' + name + '">' + name + '</a>\n' +
                '                                                    <div class="rating">\n' +
                '                                                        <div class="rating__stars-block" style="font-size: 0">';

            for ($i = 0; $i < 5; $i++) {
                if ($i+1 <= avg_rate) {
                    transfer += '<img class="rating__star" src="/img/theme/icons/star_checked.png" alt="" role="presentation" />';
                } else {
                    transfer += '<img class="rating__star" src="/img/theme/icons/star_unchecked.png" alt="" role="presentation" />';
                }
            }

            transfer +=
                '                                                    </div>\n' +
                '                                                    <div class="rating__feed-block">\n' +
                '                                                        <span class="rating__feed-count">' + reviews_count + '</span>\n' +
                '                                                        <span class="rating__feed-title">отзывов</span>\n' +
                '                                                    </div>\n' +
                '                                                </div>\n' +
                '                                            </div>\n' +
                '                                            <div class="popular__reverse-right-block">\n' +
                '                                                <div class="popular__price-shop discount">\n' +
                '                                                    <span class="popular__from-word">от</span>\n' +
                '                                                    <span class="popular__total-price shop discount">' + min_price + '</span>\n' +
                '                                                    <span class="popular__old-price"><span class="strike">' + old_price + '</span></span>\n' +
                '                                                </div>\n' +
                '                                                <div class="popular__shops">\n' +
                '                                                    <span class="popular__shop-in">в</span>\n' +
                '                                                    <span class="popular__shop-count">' + shops_count + '</span>\n' +
                '                                                    <span class="popular__shop-title">магазинах</span>\n' +
                '                                                </div>\n' +
                '                                                <a class="popular__link-shop button button-yellow" href="/sales/' + min_price_shop_url + '" title="Сравнить цены">Сравнить цены</a>\n' +
                '                                            </div>\n' +
                '                                        </div>\n' +
                '                                    </div>';
        }

        else if ($('.sortable__cards').hasClass('active')) {

            var transfer = '<div class="col-12 col-lg-4 col-md-6 col-sm-6">\n' +
                '                                            <div class="popular__card">\n' +
                '                                                <img class="popular__sale-img" src="/img/theme/icons/persent.png" alt="persent" title="">\n' +
                '                                                <a class="popular__img-link" href="/sales/' + min_price_shop_url + '" title="' + name + '">\n' +
                '                                                    <img class="popular__img" src="' + JSON.parse(image_url) + '" alt="' + name + '" title="' + name + '" />\n' +
                '                                                </a>\n' +
                '                                                <div class="popular__reverse-block">\n' +
                '                                                    <a class="popular__img-link-desc" href="/sales/' + min_price_shop_url + '" title="' + name + '">' + name +'</a>\n' +
                '                                                    <div class="rating">\n' +
                '                                                        <div class="rating__stars-block" style="font-size: 0">';

            for ($i = 0; $i < 5; $i++) {
                if ($i+1 <= avg_rate) {
                    transfer += '<img class="rating__star" src="/img/theme/icons/star_checked.png" alt="" role="presentation" />';
                } else {
                    transfer += '<img class="rating__star" src="/img/theme/icons/star_unchecked.png" alt="" role="presentation" />';
                }
            }
            transfer +=
                '                                                    </div>\n' +
                '                                                    <div class="rating__feed-block">\n' +
                '                                                        <span class="rating__feed-count">' + reviews_count + '</span>\n' +
                '                                                        <span class="rating__feed-title">отзывов</span>\n' +
                '                                                    </div>\n' +
                '                                                </div>\n' +
                '                                            </div>\n' +
                '                                            <div class="popular__reverse-right-block">\n' +
                '                                                <div class="popular__price-shop discount">\n' +
                '                                                    <span class="popular__from-word">от</span>\n' +
                '                                                    <span class="popular__total-price shop discount">' + min_price + '</span>\n' +
                '                                                    <span class="popular__old-price"><span class="strike">' + old_price + '</span></span>\n' +
                '                                                </div>\n' +
                '                                                <div class="popular__shops">\n' +
                '                                                    <span class="popular__shop-in">в</span>\n' +
                '                                                    <span class="popular__shop-count">' + shops_count + '</span>\n' +
                '                                                    <span class="popular__shop-title">магазинах</span>\n' +
                '                                                </div>\n' +
                '                                                <a class="popular__link-shop button button-yellow" href="/sales/' + min_price_shop_url + '" title="Сравнить цены">Сравнить цены</a>\n' +
                '                                            </div>\n' +
                '                                        </div>\n' +
                '                                    </div>';
        }

        return transfer;
    }

    //добавляет пробелы в числа
    function numberFormatWithSpaces(price) {
        return String(price).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
    }
});
