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
                    slidesToScroll: 1,
                    dots: false
                }
            },
            {
                breakpoint: 568,
                settings: {
                    arrows: false,
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    dots: false
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
    
    //рейтинг
    $(function() {
        
        $('.rating-container > .rating-star').mouseenter(function() {
            
            $(this).prevAll().addBack().addClass("rating-hover").attr("src", "/img/theme/icons/star_checked.png");
            $(this).nextAll().removeClass("rating-hover").addClass("no-rating").attr("src", "/img/theme/icons/star_unchecked.png");
            $('.meaning').fadeIn('fast');
            // $(this).removeClass("rating-chosen");
        });
        
        $('.rating-container > .rating-star').mouseleave(function() {
            
            $(this).nextAll().removeClass("no-rating").attr("src", "/img/theme/icons/star_unchecked.png");
        });
        
        $('.rating-container').mouseleave(function() {
            
            $(".rating-star").each(function(index) {
                
                if ($(this).hasClass('rating-chosen')) {
                    $(this).addClass("rating-hover").attr("src", "/img/theme/icons/star_checked.png");
                } else {
                    $(this).removeClass("rating-hover").attr("src", "/img/theme/icons/star_unchecked.png");
                }
                
            });
            
            $('.meaning').fadeOut('fast');
        });
        
        function starLen() {
            
            var len = $('.rating-container img.rating-chosen').length;
            $('#mark').text(len);
            $('#rate').val(len);
        }
        
        $('.rating-container > .rating-star').click(function() {
            
            $(this).prevAll().addBack().addClass("rating-chosen").attr("src", "/img/theme/icons/star_checked.png");
            $(this).nextAll().removeClass("rating-chosen").attr("src", "/img/theme/icons/star_unchecked.png");
        });
        
        $('.rating-container > .add-feed__star').hover(function() {
            
            var dataFeed = $(this).attr('data-feed');
            var dataMark = $(this).attr('data-rating');
            $(this).closest('.rating-container').next('.consult-feed__meaning-block').find('.meaning').text(dataFeed);
            $('#mark').text(dataMark);
            $('#rate').val(dataMark);
        });
        
        $('.rating-container > .add-feed__star').mouseout(function() {
            
            starLen();
            $(this).closest('.rating-container').next('.consult-feed__meaning-block').find('.meaning').text('');
        });
        
    });
    
    //Видео с youtube - первое из поиска по названию товара
    var vidWidth = 420;
    var vidHeight = 236;
    var vidResults = 1;
    $(document).ready(function() {
        var searchText = $('.title-goods__title').text();
        if (!(location.origin.indexOf('localhost') + 1)) { //Отключение для экономии единиц квоты youtube api v3 при разработке
            $.get(
                "https://www.googleapis.com/youtube/v3/search", {
                    part: 'id,snippet',
                    q: searchText,
                    maxResults: vidResults,
                    key: 'AIzaSyBUwoygkjeMNedXX1NKFdsL8zu-foc-3TM'
                },
                function(data) {
                    console.log(data)
                    videoId = data.items[0].id.videoId;
                    output = '<iframe frameborder="0" height="' + vidHeight + '" width="' + vidWidth + '" src=\"//www.youtube.com/embed/' + videoId + '\"></iframe>';
                    $('.video__video-block').html(output);
                    $('#video').show();
                }
            );
        }
    });
    
    //Добавление нового отзыва в товар
    $('body').on('submit', '#addFeed', function(e) {
        e.preventDefault();
        var data = $('#addFeed').serialize();
        // Работа с виджетом recaptcha
        var captcha = grecaptcha.getResponse();
        if (!captcha.length) {
            $('#recaptchaError').text('* Вы не прошли проверку "Я не робот"');
            grecaptcha.reset();
        } else {
            $('#recaptchaError').text('');
            grecaptcha.reset();
            $.ajax({
                method: "POST",
                url: '/create-review/' + productId,
                data: data,
                success: function(data) {
                  
                    $.magnificPopup.open({
                        items: {
                            src: '#thanks'
                        },
                    });
                },
                error: function(data) {
                   
                    $.magnificPopup.open({
                        items: {
                            src: '#errorModal'
                        },
                    });
                }
            });
            
        }
    });
    
    //Пагинация отзывов
    $('body').on('click', '.pagination__item, .pagination__arrow-left, .pagination__arrow-right', function(e) {
        e.preventDefault();
        var reviewsBlock = "";
        $.ajax({
            type: "GET",
            url: $(this).find('a').attr('href'),
            success: data => {
                
                $('.pagination').replaceWith(data.pagination);
                data.items.forEach(function(item) {
                    reviewsBlock += getReviewHtml(item);
                });
                $('.feed__wrapper').html(reviewsBlock);
                $('html,body').animate({scrollTop: $('#feed').offset().top}, 800);
            }
        });
    });
    
    function getReviewHtml(review) {
        var name = (review.name == "" || !review.name) ? "Гость" : review.name;
        var comment = (review.comment == "" || !review.comment) ? "" : review.comment;
        var advantages = (review.advantages == "" || !review.advantages) ? "" : review.advantages;
        var limitations = (review.limitations == "" || !review.limitations) ? "" : review.limitations;
        var experience_of_using = (review.experience_of_using == "" || !review.experience_of_using) ? "" : review.experience_of_using;
        var rateBlock = "";
        for ($i = 0; $i < 5; $i++) {
            if ($i + 1 <= review.rate) {
                rateBlock += '<img class="rating__star" src="/img/theme/icons/star_checked.png" alt="" role="presentation" />';
            } else {
                rateBlock += '<img class="rating__star" src="/img/theme/icons/star_unchecked.png" alt="" role="presentation" />';
            }
        }
        
        var reviewBlock = '<div class="feed-card">\n' +
            '                            <div class="row">\n' +
            '                                <div class="col-12 col-md-4">\n' +
            '                                    <div class="feed-card__name-n-date">\n' +
            '                                        <p class="feed-card__name">' + name + '</p><span class="feed-card__divide">|</span>\n' +
            '                                        <p class="feed-card__time"><time>' + review.time + '</time></p>\n' +
            '                                    </div>\n' +
            '                                    <div class="feed-card__mark-block">\n' +
            '                                        <p class="feed-card__mark-word">Оценка</p>\n' +
            '                                        <div class="feed-card__mark-wrap"><span class="feed-card__mark">' + review.rate + '</span>\n' +
            '                                            <div class="rating">\n' +
            '                                                <div class="rating__stars-block" style="font-size: 0">\n'
            + rateBlock +
            '                                                </div>' +
            '                                                <p class="rating__choice-title">' + getRateTitle(review.rate) + '</p>\n' +
            '                                            </div>\n' +
            '                                        </div>\n' +
            '                                    </div>\n' +
            '                                </div>\n' +
            '                                <div class="col-12 col-md-8">\n';
        
        if (review.recommended == 1) {
            reviewBlock += '<p class="feed-card__recommend-accept">Реккомендую покупку</p>\n';
        } else {
            reviewBlock += '<p class="feed-card__recommend-reject">Не реккомендую покупку</p>\n';
        }
        
        reviewBlock += '<p class="feed-card__reccomend-desc">' + comment + '</p></div>\n' +
            '<div class="feed-card__bottom-block">\n' +
            '                                    <div class="col-12 col-xl-4 order-xl-1 order-lg-2 order-md-2 order-sm-2 order-2">\n' +
            '                                        <div class="feed-card__useful-block">Полезен&nbsp;ли отзыв? <p class="feed-card__useful-title"></p>\n' +
            '                                            <div class="feed-card__useful-btn-block"><label class="feed-card__useful-btn button active"><input class="feed-card__usefull-input usefull-btn" type="radio" checked="checked" name="feed1"><span class="feed-card__useful-span">Да</span></label><label class="feed-card__useful-btn button"><input class="feed-card__usefull-input not-usefull-btn" type="radio" name="feed2"><span class="feed-card__useful-span">Нет</span></label></div>\n' +
            '                                        </div>\n' +
            '                                    </div>\n' +
            '                                    <div class="col-12 col-xl-8 d-flex flex-wrap align-items-center order-xl-2 order-lg-1 order-md-1 order-sm-1 order-1">\n' +
            '<div class="feed-card__liked-row"><span class="feed-card__liked-status">Понравилось</span>\n' +
            '                                            <p class="feed-card__liked-desc">' + advantages + '</p>\n' +
            '                                        </div>\n' +
            '<div class="feed-card__liked-row"><span class="feed-card__disliked-status">Не&nbsp;понравилось</span>\n' +
            '                                            <p class="feed-card__liked-desc">' + limitations + '</p>\n' +
            '                                        </div>\n' +
            '<div class="feed-card__liked-row"><span class="feed-card__exp-status">Опыт использования</span>\n' +
            '                                                <p class="feed-card__liked-desc">' + experience_of_using + '</p>\n' +
            '                                            </div>\n' +
            '                                    </div>\n' +
            '                                </div>\n' +
            '                            </div>\n' +
            '                        </div>';
        
        return reviewBlock;
    }
    
    function getRateTitle($rateNum) {
        switch ($rateNum) {
            case 1:
                return "Очень плохо";
                break;
            case 2:
                return "Так себе";
                break;
            case 3:
                return "Удовлетворительно";
                break;
            case 4:
                return "Похвально";
                break;
            case 5:
                return "Отлично";
                break;
        }
    }
    
    $('.price-block__button').click(function(e) {
        e.preventDefault();
        $('.price-block__button, .price-block__shop-count').hide();
        $('#price').find('.row').show();
    });
    
});
