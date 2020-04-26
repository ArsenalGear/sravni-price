//Функции инициализирующиеся или срабатывающие по document.ready
$(function() {
    
    //вверх
    $(function() {
        
        $(window).scroll(function() {
            
            if ($(this).scrollTop() != 0) {
                
                $('#toTop').fadeIn();
                
            } else {
                
                $('#toTop').fadeOut();
                
            }
            
        });
        
        $('#toTop').click(function() {
            
            $('body,html').animate({scrollTop: 0}, 800);
            
        });
        
    });
    
    //якоря
    $('.anchor-link').on('click', function() {
        
        var elementClick = $(this).attr("href");
        var destination = $(elementClick).offset().top;
        jQuery("html:not(:animated),body:not(:animated)").animate({
            scrollTop: destination
        }, 1000);
        return false;
    });
    
    $('.feed-card__useful-btn').on('click', function() {
        
        if ($(this).find('input[checked]')) {
            $(this).closest('.feed-card__useful-btn-block').find('.feed-card__useful-btn').removeClass('active');
            $(this).addClass('active');
        }
    });
    
    // Убираем плейсхолдер у поля формы при фокусе на нем
    if ($('input, textarea').length > 0) {
        $('input, textarea').focus(function() {
            $(this).data('placeholder', $(this).attr('placeholder')).attr('placeholder', '');
        }).blur(function() {
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
            $("#drop-down").animate({width: '100%'}, 300);
            $('header, main').toggleClass('opacity');
        } else {
            
            $(this).toggleClass('menu-btn_active');
            $('.drop-down').toggleClass('hidden');
        }
    });
    
    //закрытие модалки по крестику
    $('.modal__close-modal').on('click', function(e) {
        
        $("#drop-down").animate({width: '1%'}, 300);
        
        setTimeout(function() {
            
            $('.drop-down').toggleClass('hidden').toggleClass('nav-opacity');
        }, 290);
        
        $('#menuBtn').toggleClass('menu-btn_active');
        $('header, main').toggleClass('opacity');
    });
    
    $("#goodSlider").slick({
        autoplay: false,
        dots: true,
        arrows: false,
        customPaging: function(slider, i) {
            var thumb = $(slider.$slides[i]).find('img');
            return '<a><img src="' + thumb[0].currentSrc + '"></a>';
        },
    });
    
    //многострадальный слайдер со ссылками на главной
    $('#slider-main').slick({
        
        autoplay: true,
        autoplaySpeed: 3000,
        speed: 1000,
        slidesToScroll: 1,
        infinite: true,
        arrows: true,
        fade: true,
        cssEase: 'linear',
    });
    
    //слайдер со скидками на главной
    $('#sale-slider').slick({
        
        // autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        speed: 1000,
        infinite: true,
        arrows: true,
        adaptiveHeight: true,
        cssEase: 'linear',
        
        responsive: [
            {
                breakpoint: 991,
                settings: {
                    arrows: false,
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    dots: true
                }
            },
            {
                breakpoint: 768,
                settings: {
                    arrows: false,
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    dots: false
                }
            },
            {
                breakpoint: 568,
                settings: {
                    arrows: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: false
                }
            }
        ]
    });
    
    //слайдер с популярными товарами
    $('#popular-slider').slick({
        
        // autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        speed: 200,
        infinite: true,
        arrows: true,
        adaptiveHeight: true,
        cssEase: 'linear',
        
        responsive: [
            {
                breakpoint: 991,
                settings: {
                    arrows: false,
                    slidesToShow: 3,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 768,
                settings: {
                    arrows: false,
                    slidesToShow: 2,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 568,
                settings: {
                    arrows: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: true
                }
            }
        ]
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
                if ($(window).width() < 700) {
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
                if ($(window).width() < 700) {
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
                
                if ($(window).width() < 700) {
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
