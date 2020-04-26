//Функции инициализирующиеся или срабатывающие по document.ready
$(function () {

    // Убираем плейсхолдер у поля формы при фокусе на нем
    if ($('input, textarea').length > 0) {
        $('input, textarea').focus(function () {
            $(this).data('placeholder', $(this).attr('placeholder'))
                .attr('placeholder', '');
        }).blur(function () {
            $(this).attr('placeholder', $(this).data('placeholder'));
        });
    }

    // //Все инпуты с типом tel имеют маску +7 (999) 999 99 99
    if ($('input[type=tel]').length > 0) {
        $('input[type=tel]').mask('+7 (999) 999 99 99');
    }

    //меню
    $('#menuBtn').on('click', function(e) {

        e.preventDefault();

        if ($(window).width() <= 991) {

            $(this).toggleClass('menu-btn_active');
            $('.drop-down').toggleClass('hidden').toggleClass('nav-opacity');
            $("#drop-down").animate({width:'100%'}, 300);
            $('header, main').toggleClass('opacity');
        }
        else {

            $(this).toggleClass('menu-btn_active');
            $('.drop-down').toggleClass('hidden');
        }
    });

    //закрытие модалки по крестику
    $('.modal__close-modal').on('click', function(e) {

        $("#drop-down").animate({width:'1%'}, 300);

        setTimeout(function () {

            $('.drop-down').toggleClass('hidden').toggleClass('nav-opacity');
        }, 290);

        $('#menuBtn').toggleClass('menu-btn_active');
        $('header, main').toggleClass('opacity');
    });

    //оверлей на поиск в шапке
    $('#search-input').focus(function() {

        $('#overlay').show();
        $('.header__search').addClass('input-overlay');
    });

    //оверлей на поиск в шапке скрытие
    $('#overlay').on('click', function() {

        $(this).hide();
    });
    
    //добавление магазина из субфутера
    $('.sub-footer__add-shop').magnificPopup({
        // type: 'inline',
        preloader: true,
        focus: '#fio',
        // closeBtnInside: true,

        callbacks: {
            beforeOpen: function() {
                if($(window).width() < 700) {
                    this.st.focus = false;
                } else {
                    this.st.focus = '#name';
                }
            }
        }
    });

    //добавление магазина из блока поделиться
    $('.shop-add__shop-card-no-border').magnificPopup({

        preloader: true,
        focus: '#fio',

        callbacks: {
            beforeOpen: function() {
                if($(window).width() < 700) {
                    $('#addShop').find('button').css('pointer-events', 'unset');
                    this.st.focus = false;
                } else {
                    $('#addShop').find('button').css('pointer-events', 'unset');
                    this.st.focus = '#name';
                }
            }
        }
    });
    
    //вызов выбор региона из селекта в шапке и добавление в textarea там же
    $('#countrySelect').on('change', function() {
        changeRegion();
    });

    //открытие модалки на выбор города
    $('.header__select-block').magnificPopup({

        preloader: true,

        callbacks: {
            
            beforeOpen: function() {
    
                getRegions();
                
                if($(window).width() < 700) {
                    this.st.focus = false;
                } else {
                    this.st.focus = '#name';
                }
            }
        }
    });

    //передача города в шапку
    $('body').on('click', '.add-shop__region', function() {
        var region = $(this).text();
        $('.header__select').text(region);
    });

    //закрытие модалки после окончательного выбора региона из textarea в шапке селекта
    $('body').on('click', '.add-shop__region', function() {
        let hostObj = (new URL(window.location.href));
        let hostname = hostObj.hostname;
        let hostnameArr = hostname.split('.');
        let dataSlug = $(this).attr('data-slug');
        let params = window.location.search;
        if (hostnameArr.length == 2) {
            //Это основной домен
            var href = hostObj.protocol + "//" + dataSlug + '.' + hostname + hostObj.pathname;
        } else {
            //Это поддомен
            var href = hostObj.protocol + "//" + dataSlug + '.' + hostnameArr[1] + '.' + hostnameArr[2] + hostObj.pathname;
        }
        if (params !== "") {
            href += params;
        }

        location.href = href;

        $.magnificPopup.close();
        $('#countrySelect').find('option').remove();
    });
    
    $('body').on('click', '.add-shop__close', function() {
        $.magnificPopup.close();
        $('#countrySelect').find('option').remove();
    });

});
