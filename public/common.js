jQuery(function ($) {

    //Мобильная версия канбана
    if ($(window).width() <= 575) {
        (function ($) {

            // Detect touch support
            $.support.touch = 'ontouchend' in document;

            // Ignore browsers without touch support
            if (!$.support.touch) {
                return;
            }

            var mouseProto = $.ui.mouse.prototype,
                _mouseInit = mouseProto._mouseInit,
                _mouseDestroy = mouseProto._mouseDestroy,
                touchHandled;

            function simulateMouseEvent(event, simulatedType) {

                // Ignore multi-touch events
                if (event.originalEvent.touches.length > 1) {
                    console.log('24');
                    return;
                }

                event.preventDefault();

                var touch = event.originalEvent.changedTouches[0],
                    simulatedEvent = document.createEvent('MouseEvents');

                // Initialize the simulated mouse event using the touch event's coordinates
                simulatedEvent.initMouseEvent(
                    simulatedType,    // type
                    true,             // bubbles
                    true,             // cancelable
                    window,           // view
                    1,                // detail
                    touch.screenX,    // screenX
                    touch.screenY,    // screenY
                    touch.clientX,    // clientX
                    touch.clientY,    // clientY
                    false,            // ctrlKey
                    false,            // altKey
                    false,            // shiftKey
                    false,            // metaKey
                    0,                // button
                    null              // relatedTarget
                );

                // Dispatch the simulated event to the target element
                event.target.dispatchEvent(simulatedEvent);
            }

            mouseProto._touchStart = function (event) {

                console.log('58');
                $('.header__draggble').slideDown();

                // $(this).closest('.portlet').hide();

                var self = this;

                // $(window).click(function(e) {
                //     var x = e.clientX, y = e.clientY,
                //         elementMouseIsOver = document.elementFromPoint(x, y);
                //
                //     alert(elementMouseIsOver);
                // });
                $('.column').sortable({
                    disabled: false,
                    connectWith: ".column",
                    placeholder: 'emptyspace',

                    start: function (event, ui) {
                        console.log('start');

                        ui.item.sortStart = $(this).sortable('serialize', {key: 'sort'});

                        if (ui.item.find('.kanban-card__ban-icon').css('display') == 'block') {
                            $('#hidden-ban-block').text('1');
                        }
                        else {
                            $('#hidden-ban-block').text('');
                        }
                        $('.control-checked').prop('checked', false);
                        $('.temp-check').prop('checked', false);
                        $('.footer').hide();
                        ui.item.isChanged = false;
                        ui.item.laststate = ui.item.parent('.column').data('href');
                        ui.item.lastindex = ui.item.index();
                        ui.item.addClass('tilt');
                        cardsCount = ui.item.prev().length;
                        ui.item.css({position: 'fixed'});
                        var cardheight = ui.item.height() + 2;
                        $('.emptyspace').css('height', cardheight);
                    },

                    remove: function (event, ui) {

                        console.log('remove');

                        var workId = parseInt($('#modalEditId').text());
                        var optionName = $(this).data('option-name');
                        var card_id = ui.item.attr('data-work-id');//получение id карточки
                        var url = "/change-work-blocked/" + window.project_id + "/" + card_id;

                        $.ajax({
                            type: "POST",
                            url: url,
                            data: {
                                "reset": "true"
                            },
                            success: function (data) {

                            }
                        });

                        toggleWorkIcon(optionName, false, 'edit', workId);
                    },

                    sort: function (event, ui) {

                        console.log('sort');

                        $(".column").sortable("refreshPositions");
                        var kanbanWidth = $('.kanban__main-block').width();
                        ui.helper.offset(ui.position);
                        var elements = document.elementsFromPoint(event.pageX, event.pageY);
                        for (var i = 0; i < elements.length; i++) {

                            if ($(elements[i]).attr('class') == 'up' || $(elements[i]).attr('class') == 'down') {
                                var columnIdForScroll = $(elements[i]).closest('.kanban__column').find('.kanban__column-kan-block').data('href');
                                if ($(elements[i]).attr('class') == 'up') {
                                    var scrollTopCustom = 0;
                                    var speed = 1000;
                                }
                                else if ($(elements[i]).attr('class') == 'down') {
                                    var scrollTopCustom = 2000;
                                    var speed = 1000;
                                }
                                break;
                            } else {
                                $('.kanban__column-kan-block').stop();
                            }
                        }
                        $('[data-href="' + columnIdForScroll + '"]').animate({scrollTop: scrollTopCustom}, speed);
                        var leftPos = $('.kanban__main-block').scrollLeft();

                        if (event.pageX <= 150) {
                            $('.kanban__main-block').clearQueue();
                            $('.kanban__main-block').animate({scrollLeft: leftPos - kanbanWidth}, 1500);
                        }
                        else if (event.pageX >= kanbanWidth - 150) {
                            $('.kanban__main-block').clearQueue();
                            $('.kanban__main-block').animate({scrollLeft: leftPos + kanbanWidth}, 1500);
                        }
                        else {
                            $('.kanban__main-block').clearQueue();
                            $('.kanban__main-block').stop();
                        }
                        //Может, это нужно вынести куда-нибудь за пределы sortable?
                        $('body').mouseup(function () {
                            $('.kanban__main-block').clearQueue();
                            $('.kanban__main-block').stop();
                        });
                    },

                    update: function (e, ui) {
                        console.log('update');
                        ui.item.sort = $(this).sortable('serialize', {key: 'sort'});
                    },

                    stop: function (event, ui) {

                        console.log('stop');

                        $('.header__draggble').slideUp();

                        if (userId == projectCreator.user_id && parseInt($('#time-remaning').text()) < 1) {
                            $(this).sortable("cancel");
                            ui.item.removeClass('tilt');
                            $('.red-block').hide();
                            showAlertModal('Срок действия сервиса подошёл к концу. Не беспокойтесь ваши данные не пропадут - они надёжно сохранены в Гибкой смете. Вы сможете приобрести подписку и продолжить использовать все инструменты для совместной работы.', PremiumOff, 'overlay-mini-vip');
                        }

                        else if (userId != projectCreator.user_id && parseInt($('#time-remaning').text()) < 1) {
                            $(this).sortable("cancel");
                            ui.item.removeClass('tilt');
                            $('.red-block').hide();
                            var alertText = "У данного пользоателя закончилась подписка. Вы можете связаться с ним по указанным ниже координатам: <br>" + getProjectCreatorPropsAva();
                            showAlertModal(alertText, modalAlertCancelCreated, 'overlay-mini');
                        }

                        else {

                            if (!userRights.change_sequence_and_durability && $(".red-block").is(':visible')) {
                                $('#overlay-mini').show();
                                var alertText = "Изменять последовательность и длительность работ могут только: <br>" + allUsersRights.change_sequence_and_durability;
                                showAlertModal(alertText, modalAlertRightsChange, 'undefined');
                                $(this).sortable("cancel");
                            }

                            recalc();

                            if (ui.item.sort !== 'sort=' && typeof(ui.item.sort) !== 'function') {
                                $.ajax({
                                    type: "POST",
                                    url: "/save-new-order/" + window.project_id,
                                    data: {
                                        "sort": ui.item.sort
                                    },
                                    success: function (data) {
                                        ui.item.access = data.access;
                                    }
                                });
                            }

                            my_this = jQuery(this);
                            jQuery('.close-time-modal').on('click', function (e) {
                                my_this.sortable('cancel');
                                $.ajax({
                                    type: "POST",
                                    url: "/save-new-order/" + window.project_id,
                                    data: {
                                        "sort": ui.item.sortStart
                                    },
                                    success: function (data) {
                                        ui.item.access = data.access;
                                    }
                                });
                            });

                            $('.footer').css('display', 'none');
                            $('.checkbox-label__checxbox-input').prop('checked', false);
                            ui.item.removeClass('tilt');

                            if ((ui.item.parent('.column').data('href') != 4 && ui.item.laststate == 4)) {
                                ui.item.find('.kanban-card__ban-icon').hide();
                            }

                            //Запрет на добавление карточек в колонку "В работе", если карточек больше четырёх
                            if (ui.item.parent('.column').data('href') == 4 && ui.item.laststate != 4) {
                                $('.preloader-block').show();
                                $('#overlay-sort').show();
                                var cardsInColumn = ui.item.parent('.column').find('.kanban-card').length; //всего крточек в канбане в столюце в работе
                                var cardsInColumnBan = Number($('#ban-count').text()); //всего крточек в канбане в столюце в работе

                                cardsInColumn = cardsInColumn - cardsInColumnBan;

                                ui.item.find('.portlet-header').css('background-image', 'linear-gradient(to top, #f9a825 -25%, transparent 85%)');
                                var alertText = "Стадия  \"В работе\" может содержать не более " + limits.in_work_limit_count.value + " карточек. Потому что одновременное выполнение более четырёх работ рассеивает внимание, затягивает сроки, усложняет планирование и снижает качество контроля. <br><br> Освободите место, переместив одну из текущих работ На приёмку или в Запланированные";
                                if (cardsInColumn > limits.in_work_limit_count.value && limits.in_work_limit_count.value > 0) {
                                    $('.red-block').remove();
                                    //мигание карточки при переполнении в работе
                                    $(function () {
                                        setTimeout(function () {
                                            ui.item.find('.portlet-header').css('background-image', 'none');
                                            showAlertModal(alertText, modalAlertDeactivated, 'overlay-mini');
                                        }, 2000);
                                    });
                                    return false;
                                }
                                var workId = ui.item.data('work-id');

                                $.ajax({
                                    type: "POST",
                                    url: "/get-and-save-durability/" + window.project_id + "/" + workId,
                                    success: function (data) {
                                        $('.preloader-block').hide();
                                        //позиционирование модалок
                                        var height = document.documentElement.clientHeight;
                                        var namemodal = $(".time-modal-wide").height() + 20;
                                        var totalheight = (height - namemodal) / 2;
                                        $('.time-modal-wide').css('margin-top', totalheight);

                                        $('.preloader-block').hide();

                                        $('.time-modal-wide').show();
                                        if (data == 0) {
                                            $('.red-block').show();
                                            $('#datepicker-wide-input').val('').css({
                                                'background-color': '#f5f5f5',
                                                'color': 'transparent'
                                            }).attr('disabled', 'disabled').removeAttr("required");
                                            $('#time-modal-wide__input').val('').css('background-color', '#f5f5f5').attr('disabled', 'disabled').removeAttr("required");
                                        }
                                        else {
                                            $('.red-block').show();
                                            $('#time-modal-wide__input').val(data).removeAttr("disabled").prop('required', true).css('color', '#333');
                                            $('#time-modal-wide__input, #datepicker-wide-input').css('background-color', 'white');
                                            $('#datepicker-wide-input').removeAttr("disabled").prop('required', true).css('color', '#333');
                                        }

                                        var daysMiniModal = data;

                                        $('.time-modal-wide__day-val').text(declOfNum(daysMiniModal));

                                        $('#time-modal-wide__input').trigger('input');
                                        $('#label-time-checkbox-wide').trigger('input');


                                        if (data == 0 || data == '') {
                                            $('#label-time-checkbox-wide').prop('checked', true);
                                        }
                                        else {
                                            $('#label-time-checkbox-wide').prop('checked', false);
                                        }
                                        $('.hidden-time-input').text(workId);
                                    }
                                });
                            }
                            //
                            if (ui.item.parent('.column').data('href') == 3 && ui.item.laststate != 3 && ui.item.laststate != 1) {
                                var workId = ui.item.data('work-id');
                                ui.item.find('.portlet-header').css('background-image', 'linear-gradient(to top, #f9a825 -25%, transparent 85%)');
                                $('#overlay-sort, .preloader-block').show();

                                $.ajax({
                                    type: "POST",
                                    url: "/get-and-save-durability/" + window.project_id + "/" + workId,
                                    success: function (data) {
                                        $('.preloader-block').hide();
                                        $('#time-modal__input').val(data);
                                        if (data == 0) {
                                            $('#time-modal__input').val('').css('background-color', '#f5f5f5').attr('disabled', 'disabled').removeAttr("required");
                                        }
                                        else {
                                            $('#time-modal__input').css('background-color', 'white').removeAttr("disabled").prop('required', true);
                                        }
                                        $('#label-time-checkbox, #time-modal__input').trigger('input');
                                        var daysMiniModal = data;

                                        $('.time-modal__day-val').text(declOfNum(daysMiniModal));

                                        //позиционирование модалок
                                        var height = document.documentElement.clientHeight;
                                        var namemodal = $(".time-modal").height() + 20;
                                        var totalheight = (height - namemodal) / 2;
                                        $('.time-modal').css('margin-top', totalheight).show();
                                        ;

                                        if (data == 0 || data == '') {
                                            $('#label-time-checkbox').prop('checked', true);
                                        }
                                        else {
                                            $('#label-time-checkbox').prop('checked', false);
                                        }
                                        $('.hidden-time-input-tiny').text(workId);
                                    }
                                });
                            }

                            //отмена перемещения карточки
                            $(".close-time-modal").click(function () {
                                var card_id = $('.hidden-time-input-tiny').text();//получение id карточки
                                var url = "/change-work-blocked/" + window.project_id + "/" + card_id;
                                var hiddenBanBlock = $('#hidden-ban-block').text();
                                if (hiddenBanBlock == 1) {
                                    $.ajax({
                                        type: "POST",
                                        url: url,

                                        success: function () {
                                            $('.kanban').find('#card-' + card_id + '').find('.kanban-card__ban-icon').show();
                                        }
                                    });
                                }

                                $('#overlay-recalc').show();
                                ui.item.find('.portlet-header').css('background-image', 'none');

                                //пересчитать время
                                var workId = ui.item.data('work-id');
                                var newState = $(ui.item).closest('.kanban__column-kan-block').data('href');
                                changeWorkState(window.project_id, workId, newState);
                            });

                            var elements = document.elementsFromPoint(event.screenX, event.screenY);
                            for (var i = 0; i < elements.length; i++) {

                                //Если у элемента есть data-id, получаем его. Остальные элементы игнорируем
                                if ($(elements[i]).data('id')) {
                                    var columnId = $(elements[i]).data('id');
                                    break; //Элементов с data-id может оказаться несколько, нам нужен только самый первый
                                }
                            }

                            //Скрываем свёрнутый вариант колонки, показываем развёрнуютую колонку с data-href, равным data-id свёрнутого варианта
                            $('[data-id="' + columnId + '"]').closest('.kanban__short-column').hide();
                            $('[data-href="' + columnId + '"]').closest('.kanban__column').show();
                            ui.item.appendTo($('[data-href="' + columnId + '"]'));

                            var workId = ui.item.data('work-id');
                            var newState = ui.item.parent().data('href');

                            fromStateToStateReturn = fromStateToState(ui.item.laststate, ui.item.parent('.column').data('href'));
                            if (newState != ui.item.laststate && fromStateToStateReturn) { //Если мы перетаскиваем карточки в одной и той же колонке, состояние менять не нужно
                                changeWorkState(window.project_id, workId, newState);
                            }

                            if ($(".trigger:first").is(":hidden") || $(".trigger").eq(1).is(":hidden")) {
                                $('.red-block').remove();
                            }

                            return fromStateToStateReturn;
                        }
                    },

                    change: function (event, ui) {

                        console.log('change');

                        $('.red-block').show();
                        var next = $('.emptyspace').next();
                        var prev = $('.emptyspace').prev().prev();
                        var nextClass = next.attr('class');
                        var prevClass = prev.attr('class');
                        var cardHeight = ui.item.height();

                        $('.red-block').height(cardHeight).css('border', '1px solid');
                        $('.red-block:after').css('display', 'block');

                        if (next.is('div') || prev.is('div')) {
                            if (next.is('div') && ( nextClass.indexOf('red-block') + 1 )) {
                                $('.red-block').height('-2px').css('border', '0');
                                $('.red-block').hide();
                            }
                            else if (prev.is('div') && ( prevClass.indexOf('red-block') + 1 )) {
                                $('.red-block').height('-2px').css('border', '0');
                                $('.red-block').hide();
                            }
                        }

                        if (!ui.item.isChanged) {
                            $("<div class=\"red-block\"></div>").insertBefore(ui.item);
                            ui.item.isChanged = true;
                        }
                    }
                });


                if (touchHandled || !self._mouseCapture(event.originalEvent.changedTouches[0])) {
                    console.log('63');
                    return;
                }

                touchHandled = true;

                self._touchMoved = false;

                simulateMouseEvent(event, 'mouseover');

                simulateMouseEvent(event, 'mousemove');

                simulateMouseEvent(event, 'mousedown');
            };

            mouseProto._touchMove = function (event) {

                console.log('80');

                if (!touchHandled) {
                    return;
                }

                this._touchMoved = true;

                simulateMouseEvent(event, 'mousemove');
            };

            mouseProto._touchEnd = function (event) {

                console.log('93');
                if (!touchHandled) {
                    console.log('95');
                    return;
                }

                simulateMouseEvent(event, 'mouseup');

                simulateMouseEvent(event, 'mouseout');

                if (!this._touchMoved) {

                    simulateMouseEvent(event, 'click');
                }

                touchHandled = false;
            };

            mouseProto._mouseInit = function () {

                var self = this;

                console.log('115');

                self.element.bind({
                    taphold: $.proxy(self, '_touchStart'),
                    touchmove: $.proxy(self, '_touchMove'),
                    touchend: $.proxy(self, '_touchEnd')
                });

                _mouseInit.call(self);
            };

            mouseProto._mouseDestroy = function () {

                var self = this;

                console.log('130');

                self.element.unbind({
                    taphold: $.proxy(self, '_touchStart'),
                    touchmove: $.proxy(self, '_touchMove'),
                    touchend: $.proxy(self, '_touchEnd')
                });

                _mouseDestroy.call(self);
            };

        })(jQuery);

        $('.modal-edit__close-input-modal, .modal-edit__close-modal, .modal-history__close-history-modal, .footer__link').on('tap', function (event, ui) {
            $('.column').sortable({disabled: true});
            console.log('tilt');
            $('.portlet').removeClass('tilt');
        });

        $('.portlet').on('tap', function (event, ui) {

            $('.column').sortable({disabled: true});
            $(this).removeClass('tilt');
            console.log('123456');
        });

        $('.footer__link').on('tap', function (event, ui) {
            $('.column').sortable({disabled: true});
        });

        $('.portlet').on('taphold', function (event, ui) {

           // $(this).addClass('tilt');
           console.log('161');



        });

        $('.column').sortable({disabled: true});

        $('.portlet').on('tapend', function (event, ui) {
            $('.column').sortable({disabled: true});
        });
    }
    //Десектоп версия канбана
    else {
        $('.column').sortable({
            connectWith: ".column",
            placeholder: 'emptyspace',

            start: function (event, ui) {

                ui.item.sortStart = $(this).sortable('serialize', {key: 'sort'});

                if (ui.item.find('.kanban-card__ban-icon').css('display') == 'block') {
                    $('#hidden-ban-block').text('1');
                }
                else {
                    $('#hidden-ban-block').text('');
                }

                $('.control-checked').prop('checked', false);
                $('.temp-check').prop('checked', false);
                $('.footer').hide();
                ui.item.isChanged = false;
                ui.item.laststate = ui.item.parent('.column').data('href');
                ui.item.lastindex = ui.item.index();
                ui.item.addClass('tilt');
                cardsCount = ui.item.prev().length;
                ui.item.css({position: 'fixed'});
                var cardheight = ui.item.height() + 2;
                $('.emptyspace').css('height', cardheight);
            },

            remove: function (event, ui) {
                var workId = parseInt($('#modalEditId').text());
                var optionName = $(this).data('option-name');
                var card_id = ui.item.attr('data-work-id');//получение id карточки
                var url = "/change-work-blocked/" + window.project_id + "/" + card_id;
                $.ajax({
                    type: "POST",
                    url: url,
                    data: {
                        "reset": "true"
                    },
                    success: function (data) {

                    }
                });

                toggleWorkIcon(optionName, false, 'edit', workId);
            },

            sort: function (event, ui) {

                $(".column").sortable("refreshPositions");
                var kanbanWidth = $('.kanban__main-block').width();
                ui.helper.offset(ui.position);
                var elements = document.elementsFromPoint(event.pageX, event.pageY);
                for (var i = 0; i < elements.length; i++) {

                    if ($(elements[i]).attr('class') == 'up' || $(elements[i]).attr('class') == 'down') {
                        var columnIdForScroll = $(elements[i]).closest('.kanban__column').find('.kanban__column-kan-block').data('href');
                        if ($(elements[i]).attr('class') == 'up') {
                            var scrollTopCustom = 0;
                            var speed = 1000;
                        }
                        else if ($(elements[i]).attr('class') == 'down') {
                            var scrollTopCustom = 2000;
                            var speed = 3000;
                        }
                        break;
                    } else {
                        $('.kanban__column-kan-block').stop();
                    }
                }
                $('[data-href="' + columnIdForScroll + '"]').animate({scrollTop: scrollTopCustom}, speed);
                var leftPos = $('.kanban__main-block').scrollLeft();

                if (event.pageX <= 10) {
                    $('.kanban__main-block').clearQueue();
                    $('.kanban__main-block').animate({scrollLeft: leftPos - kanbanWidth}, 5000);
                }
                else if (event.pageX >= kanbanWidth - 10) {
                    $('.kanban__main-block').clearQueue();
                    $('.kanban__main-block').animate({scrollLeft: leftPos + kanbanWidth}, 5000);
                }
                else {
                    $('.kanban__main-block').clearQueue();
                    $('.kanban__main-block').stop();
                }
                //Может, это нужно вынести куда-нибудь за пределы sortable?
                $('body').mouseup(function () {
                    $('.kanban__main-block').clearQueue();
                    $('.kanban__main-block').stop();
                });
            },

            update: function (e, ui) {
                ui.item.sort = $(this).sortable('serialize', {key: 'sort'});

            },

            stop: function (event, ui) {

                if (userId == projectCreator.user_id && parseInt($('#time-remaning').text()) < 1) {
                    $(this).sortable("cancel");
                    ui.item.removeClass('tilt');
                    $('.red-block').hide();
                    showAlertModal('Срок действия сервиса подошёл к концу. Не беспокойтесь ваши данные не пропадут - они надёжно сохранены в Гибкой смете. Вы сможете приобрести подписку и продолжить использовать все инструменты для совместной работы.', PremiumOff, 'overlay-mini-vip');
                }

                else if (userId != projectCreator.user_id && parseInt($('#time-remaning').text()) < 1) {
                    $(this).sortable("cancel");
                    ui.item.removeClass('tilt');
                    $('.red-block').hide();
                    var alertText = "У данного пользоателя закончилась подписка. Вы можете связаться с ним по указанным ниже координатам: <br>" + getProjectCreatorPropsAva();
                    showAlertModal(alertText, modalAlertCancelCreated, 'overlay-mini');
                }

                else {

                    if (!userRights.change_sequence_and_durability && $(".red-block").is(':visible')) {
                        $('#overlay-mini').show();
                        var alertText = "Изменять последовательность и длительность работ могут только: <br>" + allUsersRights.change_sequence_and_durability;
                        showAlertModal(alertText, modalAlertRightsChange, 'undefined');
                        $(this).sortable("cancel");
                    }

                    recalc();

                    if (ui.item.sort !== 'sort=' && typeof(ui.item.sort) !== 'function') {
                        $.ajax({
                            type: "POST",
                            url: "/save-new-order/" + window.project_id,
                            data: {
                                "sort": ui.item.sort
                            },
                            success: function (data) {
                                ui.item.access = data.access;
                            }
                        });
                    }

                    my_this = jQuery(this);
                    jQuery('.close-time-modal').on('click', function (e) {
                        my_this.sortable('cancel');
                        $.ajax({
                            type: "POST",
                            url: "/save-new-order/" + window.project_id,
                            data: {
                                "sort": ui.item.sortStart
                            },
                            success: function (data) {
                                ui.item.access = data.access;
                            }
                        });
                    });

                    $('.footer').css('display', 'none');
                    $('.checkbox-label__checxbox-input').prop('checked', false);
                    ui.item.removeClass('tilt');

                    if ((ui.item.parent('.column').data('href') != 4 && ui.item.laststate == 4)) {
                        ui.item.find('.kanban-card__ban-icon').hide();
                    }

                    //Запрет на добавление карточек в колонку "В работе", если карточек больше четырёх
                    if (ui.item.parent('.column').data('href') == 4 && ui.item.laststate != 4) {
                        $('.preloader-block').show();
                        $('#overlay-sort').show();
                        var cardsInColumn = ui.item.parent('.column').find('.kanban-card').length; //всего крточек в канбане в столюце в работе
                        var cardsInColumnBan = Number($('#ban-count').text()); //всего крточек в канбане в столюце в работе

                        cardsInColumn = cardsInColumn - cardsInColumnBan;

                        ui.item.find('.portlet-header').css('background-image', 'linear-gradient(to top, #f9a825 -25%, transparent 85%)');
                        var alertText = "Стадия  \"В работе\" может содержать не более " + limits.in_work_limit_count.value + " карточек. Потому что одновременное выполнение более четырёх работ рассеивает внимание, затягивает сроки, усложняет планирование и снижает качество контроля. <br><br> Освободите место, переместив одну из текущих работ На приёмку или в Запланированные";
                        if (cardsInColumn > limits.in_work_limit_count.value && limits.in_work_limit_count.value > 0) {
                            $('.red-block').remove();
                            //мигание карточки при переполнении в работе
                            $(function () {
                                setTimeout(function () {
                                    ui.item.find('.portlet-header').css('background-image', 'none');
                                    showAlertModal(alertText, modalAlertDeactivated, 'overlay-mini');
                                }, 2000);
                            });
                            return false;
                        }
                        var workId = ui.item.data('work-id');

                        $.ajax({
                            type: "POST",
                            url: "/get-and-save-durability/" + window.project_id + "/" + workId,
                            success: function (data) {
                                $('.preloader-block').hide();
                                //позиционирование модалок
                                var height = document.documentElement.clientHeight;
                                var namemodal = $(".time-modal-wide").height() + 20;
                                var totalheight = (height - namemodal) / 2;
                                $('.time-modal-wide').css('margin-top', totalheight);

                                $('.preloader-block').hide();

                                $('.time-modal-wide').show();
                                if (data == 0) {
                                    $('.red-block').show();
                                    $('#datepicker-wide-input').val('').css({
                                        'background-color': '#f5f5f5',
                                        'color': 'transparent'
                                    }).attr('disabled', 'disabled').removeAttr("required");
                                    $('#time-modal-wide__input').val('').css('background-color', '#f5f5f5').attr('disabled', 'disabled').removeAttr("required");
                                }
                                else {
                                    $('.red-block').show();
                                    $('#time-modal-wide__input').val(data).removeAttr("disabled").prop('required', true).css('color', '#333');
                                    $('#time-modal-wide__input, #datepicker-wide-input').css('background-color', 'white');
                                    $('#datepicker-wide-input').removeAttr("disabled").prop('required', true).css('color', '#333');
                                }

                                var daysMiniModal = data;

                                $('.time-modal-wide__day-val').text(declOfNum(daysMiniModal));

                                $('#time-modal-wide__input').trigger('input');
                                $('#label-time-checkbox-wide').trigger('input');


                                if (data == 0 || data == '') {
                                    $('#label-time-checkbox-wide').prop('checked', true);
                                }
                                else {
                                    $('#label-time-checkbox-wide').prop('checked', false);
                                }
                                $('.hidden-time-input').text(workId);
                            }
                        });
                    }
                    //
                    if (ui.item.parent('.column').data('href') == 3 && ui.item.laststate != 3 && ui.item.laststate != 1) {
                        var workId = ui.item.data('work-id');
                        ui.item.find('.portlet-header').css('background-image', 'linear-gradient(to top, #f9a825 -25%, transparent 85%)');
                        $('#overlay-sort, .preloader-block').show();

                        $.ajax({
                            type: "POST",
                            url: "/get-and-save-durability/" + window.project_id + "/" + workId,
                            success: function (data) {
                                $('.preloader-block').hide();
                                $('#time-modal__input').val(data);
                                if (data == 0) {
                                    $('#time-modal__input').val('').css('background-color', '#f5f5f5').attr('disabled', 'disabled').removeAttr("required");
                                }
                                else {
                                    $('#time-modal__input').css('background-color', 'white').removeAttr("disabled").prop('required', true);
                                }
                                $('#label-time-checkbox, #time-modal__input').trigger('input');
                                var daysMiniModal = data;

                                $('.time-modal__day-val').text(declOfNum(daysMiniModal));

                                //позиционирование модалок
                                var height = document.documentElement.clientHeight;
                                var namemodal = $(".time-modal").height() + 20;
                                var totalheight = (height - namemodal) / 2;
                                $('.time-modal').css('margin-top', totalheight).show();
                                ;

                                if (data == 0 || data == '') {
                                    $('#label-time-checkbox').prop('checked', true);
                                }
                                else {
                                    $('#label-time-checkbox').prop('checked', false);
                                }
                                $('.hidden-time-input-tiny').text(workId);
                            }
                        });
                    }

                    //отмена перемещения карточки
                    $(".close-time-modal").click(function () {
                        var card_id = $('.hidden-time-input-tiny').text();//получение id карточки
                        var url = "/change-work-blocked/" + window.project_id + "/" + card_id;
                        var hiddenBanBlock = $('#hidden-ban-block').text();
                        if (hiddenBanBlock == 1) {
                            $.ajax({
                                type: "POST",
                                url: url,

                                success: function () {
                                    $('.kanban').find('#card-' + card_id + '').find('.kanban-card__ban-icon').show();
                                }
                            });
                        }

                        $('#overlay-recalc').show();
                        ui.item.find('.portlet-header').css('background-image', 'none');

                        //пересчитать время
                        var workId = ui.item.data('work-id');
                        var newState = $(ui.item).closest('.kanban__column-kan-block').data('href');
                        changeWorkState(window.project_id, workId, newState);
                    });

                    var elements = document.elementsFromPoint(event.screenX, event.screenY);
                    for (var i = 0; i < elements.length; i++) {

                        //Если у элемента есть data-id, получаем его. Остальные элементы игнорируем
                        if ($(elements[i]).data('id')) {
                            var columnId = $(elements[i]).data('id');
                            break; //Элементов с data-id может оказаться несколько, нам нужен только самый первый
                        }
                    }

                    //Скрываем свёрнутый вариант колонки, показываем развёрнуютую колонку с data-href, равным data-id свёрнутого варианта
                    $('[data-id="' + columnId + '"]').closest('.kanban__short-column').hide();
                    $('[data-href="' + columnId + '"]').closest('.kanban__column').show();
                    ui.item.appendTo($('[data-href="' + columnId + '"]'));

                    var workId = ui.item.data('work-id');
                    var newState = ui.item.parent().data('href');

                    fromStateToStateReturn = fromStateToState(ui.item.laststate, ui.item.parent('.column').data('href'));
                    if (newState != ui.item.laststate && fromStateToStateReturn) { //Если мы перетаскиваем карточки в одной и той же колонке, состояние менять не нужно
                        changeWorkState(window.project_id, workId, newState);
                    }

                    if ($(".trigger:first").is(":hidden") || $(".trigger").eq(1).is(":hidden")) {
                        $('.red-block').remove();
                    }

                    return fromStateToStateReturn;
                }

            },

            change: function (event, ui) {

                $('.red-block').show();
                var next = $('.emptyspace').next();
                var prev = $('.emptyspace').prev().prev();
                var nextClass = next.attr('class');
                var prevClass = prev.attr('class');
                var cardHeight = ui.item.height();

                $('.red-block').height(cardHeight).css('border', '1px solid');
                $('.red-block:after').css('display', 'block');

                if (next.is('div') || prev.is('div')) {
                    if (next.is('div') && ( nextClass.indexOf('red-block') + 1 )) {
                        $('.red-block').height('-2px').css('border', '0');
                        $('.red-block').hide();
                    }
                    else if (prev.is('div') && ( prevClass.indexOf('red-block') + 1 )) {
                        $('.red-block').height('-2px').css('border', '0');
                        $('.red-block').hide();
                    }
                }

                if (!ui.item.isChanged) {
                    $("<div class=\"red-block\"></div>").insertBefore(ui.item);
                    ui.item.isChanged = true;
                }
            }
        });
    }

    //
    $('body').on('click', '.footer__link', function () {
        $('.red-block').remove();
    });

    //
    $('.kan-card-mini-block').mouseover(function () {
        $(this).find('span').show();
    });
    $('.kan-card-mini-block').mouseout(function () {
        $(this).find('span').hide();
    });

    function totalheight() {
        height = document.documentElement.clientHeight;
        if ($(window).height > 767) {
            $('.kanban__column-kan-block').height($(window).height() - 132); // online screen scroll
        } else if ($(window).height < 767) {
            $('.kanban__column-kan-block').height($(window).height() - 185); // online screen scroll
        }
        var namemodal = $(".modal-edit").height();
        var totalheight = (height - namemodal) / 2;
        $('.modal-edit').css('margin-top', totalheight);
        // $('.modal-edit').css('margin-top', totalheight);
    };

    // VIP
    //премиум аккаунт
    var target_date = new Date().getTime() + parseInt($('#time-remaning').text()); // установить дату обратного отсчета

    var days, hours, minutes, seconds; // переменные для единиц времени

    var intervalID;

    if ($('#time-remaning').text() != 0) {
        intervalID = setInterval(function () {
            getCountdown();
        }, 1000);
    }

    function getCountdown() {

        var current_date = new Date().getTime();

        var seconds_left = Math.round((target_date - current_date) / 1000);

        days = parseInt(seconds_left / 86400);

        seconds_left = seconds_left % 86400;

        hours = parseInt(seconds_left / 3600);
        seconds_left = seconds_left % 3600;

        minutes = parseInt(seconds_left / 60);
        seconds = parseInt(seconds_left % 60);

        // строка обратного отсчета  + значение тега

        countdown = days + hours + minutes + seconds;

        // $('#vip-time').text(days + ' дн ' + hours + ' ч ' + minutes + ' мин ' + seconds + ' сек ');

        if (countdown < 1) {
            clearInterval(intervalID);
            $('#what-time').text(countdown);
            $('#premium-text').text('Подписка истекла');
            $('.table__vip-row').addClass('vip-gradient');
            $('.table__vip-outdate').text('Подписка истекла');

            var currentdate = new Date();
            var datetime = "" + currentdate.getDate() + "/"
                + (currentdate.getMonth() + 1) + "/"
                + currentdate.getFullYear();
            $('.table__vip-date').text(datetime);
            $('.kan-card-mini-block').hide();
        }
    }

    getCountdown();

    // переброс на страницу оплаты
    $('body').on('click', '#agree-pay', function () {
        window.location.href = "/payment";
    });

    //рассчет параметров экрана
    window.onresize = function () {
        totalheight();
    };

    //POPUP
    // попап в модалке имя пльзователя
    $(document).on("mouseover", ".user-popup", function () {
        $(this).next(".popup").show();
        $(this).next(".popup-left").show();
    });
    $(document).on("mouseout", ".user-popup", function () {
        $(this).next(".popup").hide();
        $(this).next(".popup-left").hide();
    });

    //ПОДСКАЗКИ
    //     //переключатель
    //         $('.search__img.off').click(function () {
    //             $('.kanban__question-img, .enter__question-block').fadeIn();
    //             $('.appear-question').fadeIn();
    //             $('.search__img.on').show();
    //             $('.search__img.off').hide();
    //         });
    //         $('.search__img.on').click(function () {
    //             $('.kanban__question-img, .enter__question-block').fadeOut();
    //             $('.appear-question').fadeOut();
    //             $('.search__img.on').hide();
    //             $('.search__img.off').show();
    //         });

    $(".appear-question, .fa-crown, .fa-clock").mouseover(function () {
        $(this).find(".popup").show();
    });
    $(".appear-question, .fa-crown, .fa-clock").mouseout(function () {
        $(".popup").hide();
    });

    //ПОИСК
    //
    function delay(callback, ms) {
        var timer = 0;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                callback.apply(context, args);
            }, ms || 0);
        };
    }

    $('.search__input').keyup(delay(function (e) {
        searchWorksList($(this).val());
    }, 500));

    //??
    function searchWorksList(query) {
        $.ajax({
            type: "POST",
            url: "/search-works-list/" + window.project_id,
            data: {
                "query": query
            },
            success: function (data) {
                $('.kan-card').hide();
                data.forEach(function (item) {
                    $('[data-work-id="' + item + '"]').show();
                })
            }
        });
    }

    //ЧИСТКИ И ОГРАНИЧИТЕЛИ
    //Чистка поиска
    $('.close-button-search').click(function (e) {
        e.preventDefault();
        var element = $(this);
        element.parent().find('.search__input').val('');
        $(".close-button-search").hide();
        $('.kan-card').show();
    });
    $(".search__input").on("change input", function () {
        if ($('.search__input').val() === '') {
            $(".close-button-search").hide();
        }
    });

    //Появление кнопки чистки в поиске
    $(".search__input").keyup(function () {
        if ($(this).val().length > 0) {
            $(this).next(".close-button-search").show();
        }
    });

    //Функция слежения ввода данных в инпут, появления блока и чистки
    function showFunc(input, clear, showBlock) {
        $('' + input + '').on('change input', function () {
            $('' + showBlock + '').show();
            $('' + clear + '').text('');
        });

    };

    //функция ограничивающая ввод в textarea
    function isNotMax(e) {
        e = e || window.event;
        var target = e.target || e.srcElement;
        var code = e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode);

        switch (code) {
            case 13:
            case 8:
            case 9:
            case 46:
            case 37:
            case 38:
            case 39:
            case 40:
                return true;
        }
        return target.value.length <= target.getAttribute('maxlength');
    }

    //Максималный ввод в циферный инпут 3 символов
    $('body').on("keyup keypress blur change", ".maxlength-three", function (e) {

        if ($(this).val().length >= 3) {
            return false;
        }
    });

    //ПЕРЕКРАСКИ
    //перекраска инпута рамки
    $(".orange-kan-input").on("change input", function () {
        if ($(this).val() == '') {
            $(this).css('border', '2px solid #f9a825');
            $(".close-button").hide();
        }
        else {
            $(this).css('border', '2px solid #9e9e9e');
        }
    });

    // Убираем фокус с инпута при загрузке страницы
    $(function () {
        $('input').blur();
    });

    //МЕНЮ
    //
    $('.header__burger').click(function () {
        $('.main-menu').slideToggle();
    });
    $('main').click(function () {
        $('.main-menu').slideUp();
    });
    // //меню в разработке
    //     $('.deactivated').on("click", function() {
    //         showAlertModal('Раздел находится в стадии разработки', modalAlertDeactivated, 'overlay-mini');
    //     });

    //МОДАЛКИ/////////////////////////////////////////////////////////////

    //функция вычисления высоты модалки с чатом
    function totalheightModals(nameModal, overlay) {

        height = document.documentElement.clientHeight;

        if ($(window).width() >= 575) {

            var nameModalHeight = $('' + nameModal + '').height();
            var totalHeight = (height - nameModalHeight) / 2;

            $('' + nameModal + '').css({'margin-top': totalHeight}).show();
            $('.chat').css({'max-height': nameModalHeight - 2});
        }
        else {

            var nameModalHeight = $('' + nameModal + '').height();

            $('' + nameModal + '').css({'margin-top': 0}).show();
        }

        $('#' + overlay + '').show();
    };

    //функция вычисления высоты модалки без чата
    function totalheightModalsWithoutChat(nameModal, overlay) {

        height = document.documentElement.clientHeight;

        if ($(window).width() >= 575) {

            var nameModalHeight = $('' + nameModal + '').height();
            var totalHeight = (height - nameModalHeight) / 2;

            $('' + nameModal + '').css({'margin-top': totalHeight}).show();
        }
        else {

            var nameModalHeight = $('' + nameModal + '').height();

            $('' + nameModal + '').css({'margin-top': 0}).show();
        }

        $('#' + overlay + '').show();
    };

    //функция закрытия модалок
    function workModalClose(nameModal, closeButton, overlay, static, different) {

        $('' + closeButton + '').closest('section').hide();
        $('' + closeButton + '').next('.wrapper').find('.modal-edit__static').remove();
        $('' + closeButton + '').next('.wrapper').find('.modal-edit__different').remove();
        $('' + closeButton + '').next('.wrapper').find('.modal-history__modal-title-block').remove();
        $('' + closeButton + '').next('.wrapper').find('.modal-history__table-wrapper').remove();
        $('#historyForm').attr('data-modal-id', ' ') ;
        $('#' + overlay + '').hide();
    }

    $('body').on("click", ".modal-history__close-history-modal", function () {

        workModalClose('', '.modal-history__close-history-modal', 'overlay-history');
    });

    //функция закрытия модалки создания
    function createModalClose() {

        $('#modalEditInput, #overlay').hide();
        $('#modalEditInput').find('input, textarea').val('');
        $('#amount-unit-area').val(null).trigger('change');
        $('input, textarea, .select2-container--default .select2-selection--single').removeClass('orange-border');
    }

    $('body').on("click", ".modal-edit__close-input-modal", function () {

        createModalClose();
    });

    //функция закрытия модалки создания
    $('body').on("click", ".modal-edit__close-modal", function () {

        workModalClose('', '.modal-edit__close-modal', 'overlay');
    });

    //Открытие главной модалки с плюса
    $('body').on("click", ".kanban__plus-icon", function (e) {

        if (userId == projectCreator.user_id && parseInt($('#time-remaning').text()) < 1) {

            // alert('случай когда у вас закончился прем');
            e.preventDefault();

            showAlertModal('Срок действия сервиса подошёл к концу. Не беспокойтесь ваши данные не пропадут - они надёжно сохранены в Гибкой смете. Вы сможете приобрести подписку и продолжить использовать все инструменты для совместной работы.', PremiumOff, 'overlay-mini-vip');
        }
        else if (userId != projectCreator.user_id && parseInt($('#time-remaning').text()) < 1) {

            // alert('случай когда у вас прем есть, а у того к кому вы зашли - нет');
            e.preventDefault();

            var alertText = "У данного пользоателя закончилась подписка. Вы можете связаться с ним по указанным ниже координатам: <br>" + getProjectCreatorPropsAva();

            showAlertModal(alertText, modalAlertCancelCreated, 'overlay-mini');
        }
        else {

            // alert('случай когда у вас прем есть');
            var rights = userRights.work_create_change_right;

            $('.modal-edit__favorites-icon').removeClass('fas far');
            $('.modal-edit__fa-eye-slash').removeClass('fiol-digit');
            $('.modal-edit__favorites-icon').addClass('far');
            $('.control-checked').prop('checked', false);
            $('.control-checked').prop('checked', false);
            $('.temp-check').prop('checked', false);
            $('.sale-alert, .footer').hide();

            if (rights == 1) {

                totalheightModals("#modalEditInput", "overlay");
            }
            else if (rights == 0) {

                e.preventDefault();

                var alertText = "Создавать новые работы может только: <br>" + allUsersRights.work_create_change_right;

                showAlertModal(alertText, modalAlertCancelCreated, 'overlay-mini');
            }
        }

        // autosize($('textarea'));
        $('#total-summ').html('0');
        $('input[required], textarea[required], .select2-container--default .select2-selection--single').addClass('orange-border');
    });

    //удаление оранжевой рамки с селекта, инпута и текстареа по изменению поля
    $("#modalEditInput textarea, #modalEditInput input:input[required]").on("change input", function () {

        if ($(this).val() == '') {

            $(this).addClass('orange-border');
        }
        else {

            $(this).removeClass('orange-border');
        }
    });

    //Максималный ввод в циферный инпут 5 символов
    $('body').on("keyup keypress blur change", ".maxlength-five", function (e) {

        if ($(this).val().length >= 5) {

            return false;
        }
    });

    //замена окончания дней в модалках
    $('body').on("change input", "#modalCreateDay", function (e) {

        var inputVal = $('#modalCreateDay').val().trim();
        $("#modalCreateDayText").text(declOfNum(inputVal));
    });

    //select2
    $('#amount-unit-area, #valAmountHistory').select2({

        minimumResultsForSearch: Infinity
    });
    $("#amount-unit-area").on("change", function () {

        $(".select2-container--default .select2-selection--single").removeClass('orange-border');
    });

    //конструктор статической части модалки
    function staticEditModal(id, subscribe, hiddenWork, name, amount, amountUnit, price, sale, fullprice, stage) {

        id = numberFormatWithSpaces(id);
        amount = numberFormatWithSpaces(amount);
        price = numberFormatWithSpaces(price);
        sale = numberFormatWithSpaces(sale);
        fullprice = numberFormatWithSpaces(fullprice);

        var transfer = '<div class="modal-edit__static">\n' +
            '                    <div class="modal-edit__id">\n' +
            '                        <span>#</span>\n' +
            '                        <span id="modalEditId">' + id + '</span>\n' +
            '                    </div>\n' +
            '\n' +
            '                    <div class="modal-edit__row">\n' +
            '                        <div class="modal-edit__desc-block">\n' +
            '\n' +
            '                        </div>\n' +
            '                        <div class="modal-edit__value-block">\n' +
            '                            <div class="modal-edit__favorites-block modal-edit__option-icon"\n' +
            '                                 data-option-name-edit="subscription">\n' +
            '                                <i class="far fa-star modal-edit__favorites-icon ' + subscribe + '"></i>\n' +
            '                                <p class="modal-edit__icon-title">Избранное</p>\n' +
            '                            </div>\n' +
            '                            <div class="modal-edit__hidden-work-block modal-edit__option-icon"\n' +
            '                                 data-option-name-edit="hidden">\n' +
            '                                <i class="fas fa-eye-slash modal-edit__fa-eye-slash ' + hiddenWork + '"></i>\n' +
            '                                <p class="modal-edit__icon-title">Скрытая работа</p>\n' +
            '                            </div>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '\n' +
            '                    <div class="modal-edit__row">\n' +
            '                        <div class="modal-edit__desc-block">\n' +
            '                            <p class="modal-edit__desc">Наименование</p>\n' +
            '                            <div class="modal-edit__notification">\n' +
            '                                <i class="fas fa-info-circle i-icon-name"></i>\n' +
            '                            </div>\n' +
            '                        </div>\n' +
            '                        <div class="modal-edit__value-block">\n' +
            '                            <div id="nameAreaUpdate" class="modal-edit__full-input textarea-input-selected name-area-update"> ' + name + ' \n' +
            '\n' +
            '                            </div>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '\n' +
            '                    <div class="modal-edit__row">\n' +
            '                        <div class="modal-edit__desc-block">\n' +
            '                            <p class="modal-edit__desc">Количество</p>\n' +
            '                            <div class="modal-edit__notification">\n' +
            '                                <i class="fas fa-info-circle i-icon-amount"></i>\n' +
            '                            </div>\n' +
            '                        </div>\n' +
            '                        <div class="modal-edit__value-block">\n' +
            '                            <div id="valAreaUpdate" class="modal-edit__usual-input textarea-input-selected amount-area-update"> ' + amount + ' \n' +
            '\n' +
            '                            </div>\n' +
            '                            <div id="amountUnitAreaUpdate" data-amount-unit="" class="modal-edit__usual-input textarea-input-selected amount-unit--area-update"> ' + amountUnit + ' \n' +
            '\n' +
            '                            </div>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '\n' +
            '                    <div class="modal-edit__row">\n' +
            '                        <div class="modal-edit__desc-block">\n' +
            '                            <p class="modal-edit__desc">Цена</p>\n' +
            '                            <div class="modal-edit__notification">\n' +
            '                                <i class="fas fa-info-circle i-icon-price"></i>\n' +
            '                            </div>\n' +
            '                        </div>\n' +
            '                        <div class="modal-edit__value-block">\n' +
            '                            <div id="priceAreaUpdate" class="modal-edit__usual-input textarea-input-selected price-area-update"> ' + price + ' \n' +
            '\n' +
            '                            </div>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '\n' +
            '                    <div class="modal-edit__row">\n' +
            '                        <div class="modal-edit__desc-block">\n' +
            '                            <p class="modal-edit__desc">Скидка</p>\n' +
            '                            <div class="modal-edit__notification">\n' +
            '                                <i class="fas fa-info-circle i-icon-sale"></i>\n' +
            '                            </div>\n' +
            '                        </div>\n' +
            '                        <div class="modal-edit__value-block">\n' +
            '                            <div id="saleAreaUpdate" class="modal-edit__usual-input textarea-input-selected sale-area-update">' + sale + '\n' +
            '\n' +
            '                            </div>\n' +
            '                            <p class="modal-edit__value-text">\n' +
            '                                %\n' +
            '                            </p>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '\n' +
            '                    <div class="modal-edit__row">\n' +
            '                        <div class="modal-edit__desc-block">\n' +
            '                            <p class="modal-edit__desc">Оплата</p>\n' +
            '                            <div class="modal-edit__notification">\n' +
            '                                <i class="fas fa-info-circle i-icon"></i>\n' +
            '                            </div>\n' +
            '                        </div>\n' +
            '                        <div class="modal-edit__value-block">\n' +
            '                            <p id="totalSumm" class="modal-edit__value-text">\n' +
            '                                ' + fullprice + '\n' +
            '                            </p>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '\n' +
            '                    <div class="modal-edit__row">\n' +
            '                        <div class="modal-edit__desc-block">\n' +
            '                            <p class="modal-edit__desc">Текущая стадия</p>\n' +
            '                            <div class="modal-edit__notification">\n' +
            '                                <i class="fas fa-info-circle i-icon-state"></i>\n' +
            '                            </div>\n' +
            '                        </div>\n' +
            '                        <div class="modal-edit__value-block">\n' +
            '                                <span id="stateAreaUpdate" class="modal-edit__stage-name ' + stateClass + '">\n' +
            '                                    ' + stage + '\n' +
            '                                </span>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '\n' +
            '                    <button type="button" class="modal-edit__left-arrow"></button>\n' +
            '                    <button type="button" class="modal-edit__right-arrow"></button>\n' +
            '\n' +
            '                </div>';

        return transfer;
    }

    //конструктор динамической части модалки
    function dynamicEditModal(plannedDuration, workStart, plannedComplete, downTime, startDay, startMonth, totalDay) {

        plannedDuration = numberFormatWithSpaces(plannedDuration);
        workStart = numberFormatWithSpaces(workStart);
        plannedComplete = numberFormatWithSpaces(plannedComplete);
        startDay = numberFormatWithSpaces(startDay);
        totalDay = numberFormatWithSpaces(totalDay);

        var transfer = '<div class="modal-edit__different">\n' +
            '\n' +
            '                    <div id="plannedDurationRow" class="modal-edit__row">\n' +
            '                        <div class="modal-edit__desc-block">\n' +
            '                            <p class="modal-edit__desc">Плановая длительность</p>\n' +
            '                            <div class="modal-edit__notification">\n' +
            '                                <i class="fas fa-info-circle i-icon"></i>\n' +
            '                            </div>\n' +
            '                        </div>\n' +
            '                        <div class="modal-edit__value-block">\n' +
            '                            <div id="plannedDuration" class="modal-edit__usual-input textarea-input-selected work-area-update">' + plannedDuration + '\n' +
            '\n' +
            '                            </div>\n' +
            '                            <p id="plannedDurationDay" class="modal-edit__value-text">\n' +
            '                                дня\n' +
            '                            </p>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '\n' +
            '                    <div id="workStartRow" class="modal-edit__row">\n' +
            '                        <div class="modal-edit__desc-block">\n' +
            '                            <p class="modal-edit__desc">Начало</p>\n' +
            '                            <div class="modal-edit__notification">\n' +
            '                                <i class="fas fa-info-circle i-icon"></i>\n' +
            '                            </div>\n' +
            '                        </div>\n' +
            '                        <div class="modal-edit__value-block">\n' +
            '                            <p id="workStart" class="modal-edit__value-text">\n' +
            '                                ' + workStart + '\n' +
            '                            </p>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '\n' +
            '                    <div id="plannedCompleteRow" class="modal-edit__row">\n' +
            '                        <div class="modal-edit__desc-block">\n' +
            '                            <p class="modal-edit__desc">Плановое завершение</p>\n' +
            '                            <div class="modal-edit__notification">\n' +
            '                                <i class="fas fa-info-circle i-icon"></i>\n' +
            '                            </div>\n' +
            '                        </div>\n' +
            '                        <div class="modal-edit__value-block">\n' +
            '                            <div id="plannedComplete" class="modal-edit__usual-input textarea-input-selected work-area-update">' + plannedComplete + '\n' +
            '\n' +
            '                            </div>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '\n' +
            '                    <div id="downTimeRow" class="modal-edit__row">\n' +
            '                        <div class="modal-edit__desc-block">\n' +
            '                            <p class="modal-edit__desc">Простой</p>\n' +
            '                            <div class="modal-edit__notification">\n' +
            '                                <i class="fas fa-info-circle i-icon"></i>\n' +
            '                            </div>\n' +
            '                        </div>\n' +
            '                        <div class="modal-edit__value-block">\n' +
            '                            <div class="modal-edit__hidden-work-block modal-edit__option-icon"\n' +
            '                                 data-option-name-edit="blocked">\n' +
            '                                <i id="downTime" class="fas fa-ban modal-edit__down-time ' + downTime + '"></i>\n' +
            '                                <input id="hiddenModalBanInput" type="checkbox" class="hidden">\n' +
            '                            </div>\n' +
            '\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '\n' +
            '                    <div id="startDayRow" class="modal-edit__row">\n' +
            '                        <div class="modal-edit__desc-block">\n' +
            '                            <p class="modal-edit__desc">В стадии с</p>\n' +
            '                            <div class="modal-edit__notification">\n' +
            '                                <i class="fas fa-info-circle i-icon"></i>\n' +
            '                            </div>\n' +
            '                        </div>\n' +
            '                        <div class="modal-edit__value-block">\n' +
            '                            <div class="modal-edit___show-block">\n' +
            '                                <span id="startDay" class="modal-edit__start-val-day">' + startDay + '</span>\n' +
            '                                <span id="startMonth" class="modal-edit__start-val-month">' + startMonth + '</span>\n' +
            '                                <div class="modal-edit__day-block">\n' +
            '                                    (\n' +
            '                                    <span id="totalDay" class="modal-edit__end-val-day">' + totalDay + '</span>\n' +
            '                                    <span id="totalDayTitle" class="modal-edit__end-val">дней</span>\n' +
            '                                    )\n' +
            '                                </div>\n' +
            '                            </div>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '\n' +
            '                </div>';

        return transfer;
    }

    //Аякс-запросы для создания, изменения и получения истории
    function historyAjax(projectId, workId, action, fieldName = false, fieldValue = false, amountUnit = false) {

        return $.ajax({

            type: "POST",
            url: "/history-actions/" + projectId + "/" + workId,
            data: {
                "action": action,
                "field-name": fieldName,
                "field-value": fieldValue,
                "amount-unit": amountUnit
            },

            success: function (data) {

                if (action == 'save-to-history' && data) {

                    $('[data-work-id="' + workId + '"]').find('.kanban-card__limit-values').html(data);
                }

                if (action == 'get-field-history') {

                    $('.modal-edit__notification').find('.i-icon-' + fieldName).hide();

                    var countOfFieldsChanges = $('.modal-edit__notification').find('.fa-info-circle:visible').length;

                    if (countOfFieldsChanges == 0) {

                        $('[data-work-id="' + workId + '"]').find('.kanban-card__i-block').hide();

                        //убирание главного оповещения если нет ни одного оповещения на канбане
                        var iIcon = $(".fas.fa-info-circle.i-icon:visible").length;

                        if (iIcon == 0) {

                            $('.clear-icon').hide();
                        }
                    }
                }
            }
        });
    }

    //зполнение строчками в модалке истории
    function getHistoryModalListHtml(fieldName, updated_at_in_words, field_value, fullname, end_date, shortname, role_name) {

        if (!role_name) {

            role_name = '';
        }

        if (fieldName == 'plannedComplete' || fieldName == 'plannedDuration') {

            if (field_value <= 0 || field_value == 'false') {

                field_value = ' - ';
                end_date = ' - ';
            } else {

                field_value = field_value + ' ' + declOfNum(field_value);
            }
        } else if (fieldName == 'extra' && field_value == '0') {

            field_value = '-';
        }

        function getStateNameByStateId(stateId) {

            var stateNames = {
                '1': 'Отложенные',
                '2': 'На оплате',
                '3': 'Запланированные',
                '4': 'В работе',
                '5': 'На приёмке',
                '6': 'Завершённые'
            }

            return stateNames[stateId];
        }

        switch (fieldName) {

            case "name":

                return '<tr class="modal-history__history-row">\n' +
                    '\n' +
                    '                            <td class="modal-history__history-days-block">\n' +
                    '\n' +
                    '                                <p class="modal-history__history-day-change">' + updated_at_in_words + '</p>\n' +
                    '\n' +
                    '                            </td>\n' +
                    '\n' +
                    '                            <td class="modal-history__history-desc-block w290">\n' +
                    '\n' +
                    '                                <p class="modal-history__history-desc">' + field_value + '</p>\n' +
                    '\n' +
                    '                            </td>\n' +
                    '\n' +
                    '                            <td class="modal-history__history-user-block">\n' +
                    '\n' +
                    '                                <p class="modal-history__history-e-mail">' + fullname + '</p>\n' +
                    '\n' +
                    '                                <p class="modal-history__history-role">' + role_name + '</p>\n' +
                    '\n' +
                    '                            </td>\n' +
                    '\n' +
                    '                        </tr>';

                break;

            case "amount":

                return '<tr class="modal-history__history-row">\n' +
                    '\n' +
                    '                            <td class="modal-history__history-days-block">\n' +
                    '\n' +
                    '                                <p class="modal-history__history-day-change">' + updated_at_in_words + '</p>\n' +
                    '\n' +
                    '                            </td>\n' +
                    '\n' +
                    '                            <td class="modal-history__history-desc-block">\n' +
                    '\n' +
                    '                                <p style="text-align: center" class="modal-history__history-desc">' + field_value + '</p>\n' +
                    '\n' +
                    '                            </td>\n' +
                    '\n' +
                    '                            <td class="modal-history__history-user-block">\n' +
                    '\n' +
                    '                                <p class="modal-history__history-e-mail">' + fullname + '</p>\n' +
                    '\n' +
                    '                                <p class="modal-history__history-role">' + role_name + '</p>\n' +
                    '\n' +
                    '                            </td>\n' +
                    '\n' +
                    '                        </tr>';

                break;

            case "price":

                return '<tr class="modal-history__history-row">\n' +
                    '\n' +
                    '                            <td class="modal-history__history-days-block">\n' +
                    '\n' +
                    '                                <p class="modal-history__history-day-change">' + updated_at_in_words + '</p>\n' +
                    '\n' +
                    '                            </td>\n' +
                    '\n' +
                    '                            <td class="modal-history__history-desc-block">\n' +
                    '\n' +
                    '                                <p style="text-align: center" class="modal-history__history-desc">' + field_value + '</p>\n' +
                    '\n' +
                    '                            </td>\n' +
                    '\n' +
                    '                            <td class="modal-history__history-user-block">\n' +
                    '\n' +
                    '                                <p class="modal-history__history-e-mail">' + fullname + '</p>\n' +
                    '\n' +
                    '                                <p class="modal-history__history-role">' + role_name + '</p>\n' +
                    '\n' +
                    '                            </td>\n' +
                    '\n' +
                    '                        </tr>';
                break;

            case "sale":

                return '<tr class="modal-history__history-row">\n' +
                    '\n' +
                    '                            <td class="modal-history__history-days-block">\n' +
                    '\n' +
                    '                                <p class="modal-history__history-day-change">' + updated_at_in_words + '</p>\n' +
                    '\n' +
                    '                            </td>\n' +
                    '\n' +
                    '                            <td class="modal-history__history-desc-block">\n' +
                    '\n' +
                    '                                <p style="text-align: center" class="modal-history__history-desc">' + field_value + ' %</p>\n' +
                    '\n' +
                    '                            </td>\n' +
                    '\n' +
                    '                            <td class="modal-history__history-user-block">\n' +
                    '\n' +
                    '                                <p class="modal-history__history-e-mail">' + fullname + '</p>\n' +
                    '\n' +
                    '                                <p class="modal-history__history-role">' + role_name + '</p>\n' +
                    '\n' +
                    '                            </td>\n' +
                    '\n' +
                    '                        </tr>';
                break;

            case "state":

                field_value = getStateNameByStateId(field_value);

                return '<tr class="modal-history__history-row">\n' +
                    '\n' +
                    '                            <td class="modal-history__history-days-block">\n' +
                    '\n' +
                    '                                <p class="modal-history__history-day-change">' + updated_at_in_words + '</p>\n' +
                    '\n' +
                    '                            </td>\n' +
                    '\n' +
                    '                            <td class="modal-history__history-desc-block">\n' +
                    '\n' +
                    '                                <p style="text-align: center" class="modal-history__history-desc">' + field_value + '</p>\n' +
                    '\n' +
                    '                            </td>\n' +
                    '\n' +
                    '                            <td class="modal-history__history-user-block">\n' +
                    '\n' +
                    '                                <p class="modal-history__history-e-mail">' + fullname + '</p>\n' +
                    '\n' +
                    '                                <p class="modal-history__history-role">' + role_name + '</p>\n' +
                    '\n' +
                    '                            </td>\n' +
                    '\n' +
                    '                        </tr>';
                break;

            case "plannedDuration":

                return '<tr class="modal-history__history-row">\n' +
                    '\n' +
                    '                            <td class="modal-history__history-days-block">\n' +
                    '\n' +
                    '                                <p class="modal-history__history-day-change">' + updated_at_in_words + '</p>\n' +
                    '\n' +
                    '                            </td>\n' +
                    '\n' +
                    '                            <td class="modal-history__history-desc-block">\n' +
                    '\n' +
                    '                                <p style="text-align: center" class="modal-history__history-desc">' + field_value + '</p>\n' +
                    '\n' +
                    '                            </td>\n' +
                    '\n' +
                    '                            <td class="modal-history__history-user-block">\n' +
                    '\n' +
                    '                                <p class="modal-history__history-e-mail">' + fullname + '</p>\n' +
                    '\n' +
                    '                                <p class="modal-history__history-role">' + role_name + '</p>\n' +
                    '\n' +
                    '                            </td>\n' +
                    '\n' +
                    '                        </tr>';
                break;

            case "plannedComplete":

                return '<tr class="modal-history__history-row">\n' +
                    '\n' +
                    '                            <td class="modal-history__history-days-block">\n' +
                    '\n' +
                    '                                <p class="modal-history__history-day-change">' + updated_at_in_words + '</p>\n' +
                    '\n' +
                    '                            </td>\n' +
                    '\n' +
                    '                            <td class="modal-history__history-desc-block">\n' +
                    '\n' +
                    '                                <p style="text-align: center" class="modal-history__history-desc">' + end_date + '</p>\n' +
                    '\n' +
                    '                            </td>\n' +
                    '\n' +
                    '                            <td class="modal-history__history-user-block">\n' +
                    '\n' +
                    '                                <p class="modal-history__history-e-mail">' + fullname + '</p>\n' +
                    '\n' +
                    '                                <p class="modal-history__history-role">' + role_name + '</p>\n' +
                    '\n' +
                    '                            </td>\n' +
                    '\n' +
                    '                        </tr>';
                break;
        }

        return html;
    }

    //функция открытия модалки истории
    function openHistoryModal(fieldName) {

        if (fieldName == 'plannedDuration' || fieldName == 'plannedComplete') {

            fieldNameDurability = 'work';
        }

        else {

            fieldNameDurability = fieldName;
        }

        var workId = parseInt($("#modalEditId").text());
        var projectId = window.project_id;

        historyList = historyAjax(projectId, workId, "get-field-history", fieldNameDurability);

        $.ajax().done(function () {

            historyListParsed = JSON.parse(historyList.responseText);

            var block = [];

            for (var i = 0; i < historyListParsed.length; i++) {
                end_date = getEndDate(historyListParsed[i].updated_at, historyListParsed[i].field_value - 1);

                block[i] = getHistoryModalListHtml(fieldName, historyListParsed[i].updated_at_in_words, historyListParsed[i].field_value, historyListParsed[i].fullname, end_date, historyListParsed[i].shortname, historyListParsed[i].role_name);
            }

            console.log(historyListParsed);

            $('#historyBody').append(block);

            $('.modal-history__last-value').val(historyListParsed[historyListParsed.length - 1].field_value);
            $('#valAmountHistoryInput').val(parseInt(historyListParsed[historyListParsed.length - 1].field_value));
            $('#datePickerHistory').val($('#plannedComplete').text().trim());
            var amountStr = historyListParsed[historyListParsed.length - 1].field_value;
            var amountStrVal = amountStr.split(' ');
            lastAmountUnitValue = $('#amountUnitAreaUpdate').attr('data-amount-unit');
            $('#valAmountHistory').val(lastAmountUnitValue);
            $('.select2-hidden-accessible').val(lastAmountUnitValue).trigger('change');
            var plannedComplete = $('#plannedComplete').text().trim();
            var plannedDuration = $('#plannedDuration').text().trim();

            if (plannedDuration == '-') {

                $("#plannedDurationHistory").css('background', '#f5f5f5').attr('disabled', 'disabled');
                $('#work-checkbox').prop('checked', true);
            }
            else {

                $("#plannedDurationHistory").removeAttr('disabled');
            }

            if (plannedComplete == '-') {

                $("#datePickerHistory").datepicker("destroy").css('background', '#f5f5f5');
                $('#datePickerCheckbox').prop('checked', true);
            }
            else {

                $('#datePickerHistory').datepicker({dateFormat: 'dd M', minDate: 0});
            }

            if ($('.modal-history__history-desc').text() == '0') {

                $('.modal-history__history-desc').text('-');
            }

            if ($('#plannedDuration').text().trim() == '-') {

                $('#plannedDurationHistory').val('');
            }

            console.log(fieldName);

            if (!userRights.change_sequence_and_durability) {

                if (allUsersRights.change_sequence_and_durability != '') {

                    $('.modal-history__history-input-block').remove();
                    $('.modal-history__btn-save').remove();
                    usersWithRightString = "Корректировать длительность работы может только " + allUsersRights.change_sequence_and_durability + "<br>";
                } else {

                    $('.modal-history__history-input-block').remove();
                    $('.modal-history__btn-save').remove();
                    usersWithRightString = "Права на изменение последовательности и длительности работ не назначены<br>";
                }

                usersWithRightBlock = '<div class="error-text">' + usersWithRightString + '</div>';
            }

            totalheightModalsWithoutChat('#modalHistory');
        });
    }

    //функция генерирования модалки истории в зависимости от того, по какому полю ее вызвали
    function openHistoryNameModal(fieldName, field_value) {

        $('#overlay-history').show();

        switch (fieldName) {

            case ('nameAreaUpdate'):

                var transferInput = '<input required="" maxlength="170" class="modal-history__textarea modal-history__last-value" name="name">';
                var staticTransfer = staticHistory('НАИМЕНОВАНИЕ', 'Изменено', '', 'Участник');
                var dynamicTransfer = dynamicHistory('', '', transferInput);

                openHistoryModal('name');
                $('#historyForm').append(staticTransfer);
                $('.modal-history__table-wrapper').append(dynamicTransfer);

                break;

            case ('valAreaUpdate'):

                var transferInput = '<input required  maxlength="5" type="number" id="valAmountHistoryInput" name="amount" class="modal-history__usual-input modal-history__last-value maxlength-five">\n' +
                    '\n' +
                    '                <select value="" class="" id="valAmountHistory" name="amount-unit">\n' +
                    '\n' +
                    '                    <option id="optionMinusOne" value=""></option>\n' +
                    '                    <option value="0">м</option>\n' +
                    '                    <option value="1"> м &sup2;</option>\n' +
                    '                    <option value="2"> м &sup3;</option>\n' +
                    '                    <option value="3">м\\пог</option>\n' +
                    '                    <option value="4">шт</option>\n' +
                    '                    <option value="5">компл</option>\n' +
                    '\n' +
                    '                </select>';

                var staticTransfer = staticHistory('КОЛИЧЕСТВО', 'Изменено', '', 'Участник');
                var dynamicTransfer = dynamicHistory('', '', transferInput);

                $('#historyForm').append(staticTransfer);
                $('.modal-history__table-wrapper').append(dynamicTransfer);

                $('#amount-unit-area, #valAmountHistory').select2({

                    minimumResultsForSearch: Infinity
                });

                openHistoryModal('amount');

                break;

            case ('priceAreaUpdate'):

                var transferInput = '<input required  maxlength="5" type="number" id="PriceHistory" name="price" class="modal-history__usual-input modal-history__last-value maxlength-five">';
                var staticTransfer = staticHistory('Цена', 'Изменено', '', 'Участник');
                var dynamicTransfer = dynamicHistory('', '', transferInput);

                $('#historyForm').append(staticTransfer);
                $('.modal-history__table-wrapper').append(dynamicTransfer);

                openHistoryModal('price');

                break;

            case ('saleAreaUpdate'):

                var transferInput = '<input  maxlength="3" type="number" id="saleHistory" name="sale" class="modal-history__usual-input modal-history__last-value maxlength-three">';
                var staticTransfer = staticHistory('Скидка', 'Изменено', '', 'Участник');
                var dynamicTransfer = dynamicHistory('', '', transferInput);

                $('#historyForm').append(staticTransfer);
                $('.modal-history__table-wrapper').append(dynamicTransfer);

                openHistoryModal('sale');

                break;

            case ('stateAreaUpdate'):

                var staticTransfer = staticHistory('ИСТОРИЯ ПЕРЕНОСА ПО СТАДИЯМ', 'Дата переноса', 'Название стадии', 'Автор переноса');

                $('#historyForm').append(staticTransfer);

                openHistoryModal('state');

                break;

            case ('plannedDuration'): //!

                var transferInput = '<i class="modal-history__triangle-down fas fa-caret-square-down"></i>\n' +
                    '\n' +
                    '                <input required  maxlength="5" type="number" id="plannedDurationHistory" name="work" class="modal-history__usual-input modal-history__last-value picker-input maxlength-five">\n' +
                    '\n' +
                    '                <i class="modal-history__triangle-up fas fa-caret-square-up"></i>\n' +
                    '\n' +
                    '                <label class="checkbox-label">\n' +
                    '                    <input id="work-checkbox" class="checkbox-label__checxbox-input-one two-px-border" type="checkbox">\n' +
                    '                    <span class="checkbox-label__checxbox-span-three"></span>\n' +
                    '                    <p>без срока</p>\n' +
                    '                </label>';

                var staticTransfer = staticHistory('ДЛИТЕЛЬНОСТЬ', 'Изменено', 'плановая длительность', 'Участник');
                var dynamicTransfer = dynamicHistory('', '', transferInput);

                $('#historyForm').append(staticTransfer);
                $('.modal-history__table-wrapper').append(dynamicTransfer);

                openHistoryModal('plannedDuration');

                break;

            case ('plannedComplete'): //!

                var transferInput = '<input readonly="true" id="datePickerHistory" name="date-picker" class="modal-history__usual-input modal-history__last-value picker-input">\n' +
                    '   <label class="checkbox-label">\n' +
                    '        <input id="datePickerCheckbox" class="checkbox-label__checxbox-input-one two-px-border" type="checkbox">\n' +
                    '        <span class="checkbox-label__checxbox-span-three"></span>\n' +
                    '        <p>без срока</p>\n' +
                    '    </label>\n' +
                    '                <input id="datePickerHistoryHidden" name="work" type="text" value="">';

                var staticTransfer = staticHistory('Плановое завершение', 'Изменено', 'плановое завершение', 'Участник');
                var dynamicTransfer = dynamicHistory('', '', transferInput);

                $('#historyForm').append(staticTransfer);
                $('.modal-history__table-wrapper').append(dynamicTransfer);

                openHistoryModal('plannedComplete');

                break;
        }
    };

    $(document).on("click", '#nameAreaUpdate', function () {

        openHistoryNameModal('nameAreaUpdate');
        $('#historyForm').attr('data-modal-id', 'name') ;
        if ($(window).width() <= 575) {
            $('.modal-history__middle-block').css('width', '290px');
            $('.modal-history__modal-table').css('width', '585px');
        }
    });

    $(document).on("click", '#valAreaUpdate, #amountUnitAreaUpdate', function () {

        openHistoryNameModal('valAreaUpdate');
        $('#historyForm').attr('data-modal-id', 'amount') ;
    });

    $(document).on("click", '#priceAreaUpdate', function () {

        openHistoryNameModal('priceAreaUpdate');
        $('#historyForm').attr('data-modal-id', 'price') ;
    });

    $(document).on("click", '#saleAreaUpdate', function () {

        openHistoryNameModal('saleAreaUpdate');
        $('#historyForm').attr('data-modal-id', 'sale') ;
    });

    $(document).on("click", '#stateAreaUpdate', function () {

        openHistoryNameModal('stateAreaUpdate');
    });

    $(document).on("click", '#plannedDuration', function () {

        openHistoryNameModal('plannedDuration');
        $('#historyForm').attr('data-modal-id', 'work') ;
    });

    $(document).on("click", '#plannedComplete', function () {

        openHistoryNameModal('plannedComplete');
        $('#historyForm').attr('data-modal-id', 'work') ;
    });

    //конструктор статической части модалки истории
    function staticHistory(title, changeTitle, middleGrayField, user) {

        var transfer = '<div class="modal-history__modal-title-block">\n' +
            '\n' +
            '                <p class="modal-history__modal-title">' + title + '</p>\n' +
            '\n' +
            '            </div>\n' +
            '\n' +
            '            <div class="modal-history__table-wrapper">\n' +
            '            <div class="modal-history__table-wrapper-inside">\n' +
            '\n' +
            '                <table class="modal-history__modal-table">\n' +
            '\n' +
            '                    <thead id="historyTableHead" class="modal-history__modal-header">\n' +
            '\n' +
            '                        <tr class="modal-history__history-row">\n' +
            '\n' +
            '                        <th class="modal-history__change-block">\n' +
            '\n' +
            '                            <p class="modal-history__change-title">' + changeTitle + '</p>\n' +
            '\n' +
            '                        </th>\n' +
            '\n' +
            '                        <th class="modal-history__middle-block">\n' +
            '                            <p class="modal-history__change-title">' + middleGrayField + '</p>\n' +
            '                        </th>\n' +
            '\n' +
            '                        <th class="modal-history__author-block">\n' +
            '\n' +
            '                            <p class="modal-history__author-title">' + user + '</p>\n' +
            '\n' +
            '                        </th>\n' +
            '                    </tr>\n' +
            '\n' +
            '                    </thead>\n' +
            ' <tbody id="historyBody"> \n' +
            ' </tbody>';

        return transfer;
    }

    //конструктор динамической части модалки истории
    function dynamicHistory(miniModalCard, saveButton, inputField) {

        var transfer = '<div class="modal-history__history-input-block">\n' +
            '\n' +
            '                ' + inputField + '\n' +
            '\n' +
            '            </div>\n' +
            '\n' +
            '            <button class="modal-history__btn-save diabled-button ' + saveButton + '" style="pointer-events: none;" type="submit">\n' +
            '                Сохранить\n' +
            '            </button>\n' +
            '                </table>\n' +
            '                </div>\n' +
            '\n' +
            '            </div>';

        return transfer;
    }

    //Открытие главной модаклки из канбана
    $(document).on("click", 'label', function (e) {

        e.stopPropagation()

    }).on("click", ".kanban-card", function (e) {

        if (userId == projectCreator.user_id && parseInt($('#time-remaning').text()) < 1) {

            showAlertModal('Срок действия сервиса подошёл к концу. Не беспокойтесь ваши данные не пропадут - они надёжно сохранены в Гибкой смете. Вы сможете приобрести подписку и продолжить использовать все инструменты для совместной работы.', PremiumOff, 'overlay-mini-vip');
        }

        else if (userId != projectCreator.user_id && parseInt($('#time-remaning').text()) < 1) {

            event.preventDefault();

            var alertText = "У данного пользоателя закончилась подписка. Вы можете связаться с ним по указанным ниже координатам: <br>" + getProjectCreatorPropsAva();

            showAlertModal(alertText, modalAlertCancelCreated, 'overlay-mini');
        }

        else {

            $('#overlay').show();

            //Чат
            $('.chat__chat-block').html('');

            window.processing = false;
            $(".chat__chat-block").mousewheel(function (e) {

                if (processing === false) {

                    processing = true;
                    setTimeout(function () {

                        processing = false;
                    }, 250); // waiting 250ms to change back to false.
                }
            });
            //запуск функции при прокрутке
            $(".chat__chat-block").on("scroll", scrolling);
            offset = 8;
            scrolling = true;

            function scrolling() {

                if ($(this).scrollTop() <= 10 && processing && scrolling) { //если колёсико мыши крутится вверх и скролл достиг верха окна чата
                    scrolling = false; //чтобы аякс не вызывался несколько раз в процессе скроллинга

                    var JWT = localStorage.getItem('jwt_token');
                    var explodedJWT = JWT.split('.');
                    var jwtUserId = JSON.parse(atob(explodedJWT[1])).user_id;
                    var workId = $('#modalEditId').html();

                    oldMessages = getChatMessages(window.project_id, workId, offset);
                    oldMessages.done(function () {
                        if (oldMessages.responseText != null) {
                            if (oldMessages.responseText != '[]') {
                                oldMessages = JSON.parse(oldMessages.responseText).reverse();
                                var block = [];
                                var i = 0;
                                oldMessages.forEach(function (messageJSON) {
                                    if (messageJSON.user_id == jwtUserId) {
                                        block[i] = getMessageHtml('self', messageJSON).toString();
                                    } else {
                                        block[i] = getMessageHtml('other', messageJSON).toString();
                                    }
                                    i++;

                                });
                                offset += 8;

                                $('.chat__chat-block').prepend(block).scrollTop(300);
                            }
                        }
                        scrolling = true;
                    });
                }
            }

            $(this).unbind("scroll");
            //конец чата

            var totalCardLenght = $(this).closest('.kanban__column-kan-block').find('.kan-card').length;
            var project_id = window.project_id;
            var card_id = $(this).closest('.portlet').attr('data-work-id');//получение id карточки
            var url = "/get-work/" + window.project_id + "/" + card_id;
            var workId = card_id;

            $('.footer').hide();
            $('.control-checked, .temp-check').prop('checked', false);
            chatConnection(project_id, card_id); //Подключаемся к чату
            $.ajax({

                type: "POST",
                url: url,

                data: {

                    "calculate": "price"
                },

                success: function (data) {

                    var parseData = JSON.parse(data);
                    var valOfMeters = parseInt(parseData.amount_unit);
                    var JWT = localStorage.getItem('jwt_token'); //Получив id из JWT, мы сможем сравнить его с id пользователя, отправившего сообщение, и если они равны, выводить "Я" вместо фамилии.
                    var explodedJWT = JWT.split('.');
                    var jwtUserId = JSON.parse(atob(explodedJWT[1])).user_id;
                    var daysModalVal = $('#plannedDuration').html();
                    var daysModalValShort = $('#startDay').html();

                    //для слайдера модалок
                    var cardLenghtsFirst = $("#card-" + workId + "").closest('.kanban__column-kan-block').find('.kan-card:first-child').attr('data-work-id');
                    var cardLenghtsLast = $("#card-" + workId + "").closest('.kanban__column-kan-block').find('.kan-card:last-child').attr('data-work-id');
                    var nameModal = parseData.name;
                    var amountModal = parseData.amount;

                    console.log(data);

                    function getAmountUnitModal(valOfMeters) {

                        switch (parseInt(valOfMeters)) {
                            case 1:
                                amount_unit = "м <sup>2</sup>";//м&sup2;
                                break;
                            case 2:
                                amount_unit = "м <sup>3</sup>";//м&sup3;
                                break;
                            case 3:
                                amount_unit = "м\\пог";
                                break;
                            case 4:
                                amount_unit = "шт";
                                break;
                            case 5:
                                amount_unit = "компл";
                                break;
                            default:
                                amount_unit = "м";
                                break;
                        }
                        return amount_unit;
                    }

                    var amountUnitModal = getAmountUnitModal(valOfMeters);
                    var priceModal = numberFormatWithSpaces(parseData.price);
                    var saleModal = parseData.sale;
                    var fullPriceModal = parseData.fullprice;
                    var stateModal = parseData.state;

                    //в стадии с
                    var start_date = new Date(parseData.start_state_date);
                    var start_day = start_date.getDate();
                    var start_month = getMonthFromNumber(start_date.getMonth() + 1);

                    //плановая длительность
                    var durability = parseData.durability;

                    //начало
                    var startDateFull = start_day + ' ' + start_month;
                    var startDay = start_date.getDate();
                    var startMonth = getMonthFromNumber(start_date.getMonth() + 1);

                    //плановое завершение
                    var endDateVal = getEndDate(parseData.start_state_date, parseData.durability - 1);

                    //заблокрованная работа
                    var blockedWork = parseData.is_blocked_work;
                    //в стадии с
                    // var startStateDate = parseData.start_state_date;

                    var lostDays = getDaysFromNowToDate(start_date);

                    var start_date = new Date(parseData.start_state_date);

                    $('#plannedComplete').text(endDateVal);
                    $('#plannedDuration').text(durability);

                    //рассчет суммы
                    $('#plannedDurationDay').text(declOfNum(daysModalVal));
                    $('#totalDayTitle').text(declOfNum(daysModalValShort));

                    if (parseData.unread_fields_changes) {

                        parseData.unread_fields_changes.forEach(function (item) {

                            $(".i-icon-" + item).show();
                        });
                    }

                    if (durability == 0) {

                        durability = '-';
                    }

                    if (parseData.durability == 0) {

                        endDateVal = '-';
                    }

                    //Активация иконки "Избранное"
                    if (parseData.subscription == "0") {

                        subscriptionModal = '';
                    } else {

                        subscriptionModal = 'fas star';
                    }

                    //Активация иконки "Скрытая работа"
                    if (parseData.is_hidden_work == "0") {

                        isHiddenWorkPriceModal = '';
                    } else {

                        isHiddenWorkPriceModal = 'fiol-digit';
                    }

                    //Активация иконки "Заблокированная работа"
                    if (parseData.is_blocked_work == "1") {

                        blockedWork = 'red-digit';
                    } else {

                        blockedWork = '';
                    }

                    switch (parseData.state) {

                        case 1:

                            stateClass = 'canseled-state';
                            stateName = "ОТЛОЖЕННЫЕ";

                            break;

                        case 2:

                            stateClass = 'imported-state';
                            stateName = "на оплате";

                            break;

                        case 3:

                            stateClass = 'planned-state';
                            stateName = "запланировано";

                            break;

                        case 4:
                            stateClass = 'in-work-state';
                            stateName = "в работе";

                            break;

                        case 5:
                            stateClass = 'pre-accepted-state';
                            stateName = "на приёмке";

                            break;

                        case 6:

                            stateClass = 'accepted-state';
                            stateName = "ЗАВЕРШЕНО";

                            break;
                    }

                    $('#stateAreaUpdate').text(stateName);
                    $('#stateAreaUpdate').addClass(stateClass);

                    oldMessages = getChatMessages(window.project_id, workId, 0);
                    oldMessages.done(function () {
                        oldMessages = JSON.parse(oldMessages.responseText).reverse();

                        var block = [];
                        var i = 0;
                        oldMessages.forEach(function (messageJSON) {
                            if (messageJSON.user_id == jwtUserId) {
                                block[i] = getMessageHtml('self', messageJSON).toString();
                            } else {
                                block[i] = getMessageHtml('other', messageJSON).toString();
                            }
                            i++;
                        });

                        $('.chat__chat-block').prepend(block).scrollTop($('.chat__chat-block').prop('scrollHeight'));
                        autosize($('textarea'));
                    });

                    staticTransfer = staticEditModal(workId, subscriptionModal, isHiddenWorkPriceModal, nameModal, amountModal, amountUnitModal, priceModal, saleModal, fullPriceModal, stateName, stateClass);
                    $('#modalEditCreateInput').append(staticTransfer);

                    dynamicTransfer = dynamicEditModal(durability, startDateFull, endDateVal, blockedWork, startDay, startMonth, lostDays);
                    $('#modalEditCreateInput').append(dynamicTransfer);

                    switch (parseData.state) {

                        case 1:

                            $('#workStartRow, #plannedCompleteRow, #downTimeRow, #startDayRow').hide();

                            break;

                        case 2:

                            $('#plannedCompleteRow, #workStartRow, #plannedDurationRow, #downTimeRow').hide();

                            break;

                        case 3:

                            $('#workStartRow, #plannedCompleteRow, #downTimeRow, #startDayRow').hide();

                            break;

                        case 4:

                            $('#startDayRow, #plannedDurationRow').hide();

                            break;

                        case 5:

                            $('#plannedCompleteRow, #workStartRow, #plannedDurationRow, #downTimeRow').hide();

                            break;

                        case 6:

                            $('#plannedCompleteRow, #workStartRow, #plannedDurationRow, #downTimeRow').hide();

                            break;
                    }

                    $('#overlay-slider').hide();
                    totalheightModals("#modalEdit", "overlay");

                    if (parseData.unread_fields_changes) {

                        parseData.unread_fields_changes.forEach(function (item) {

                            $(".i-icon-" + item).show();
                        });
                    }

                    //слайдер модалок
                    if (workId == cardLenghtsFirst) {

                        $('.modal-edit__left-arrow').addClass('hidden');
                    }
                    else if (workId == cardLenghtsLast) {

                        $('.modal-edit__right-arrow').addClass('hidden');
                    }

                    //исчезание обоих стрелок в модалке если 1 карточка в стадии
                    if (totalCardLenght == 1) {

                        $('.modal-edit__left-arrow, .modal-edit__right-arrow').addClass('hidden');
                    }

                    $('#plannedDurationDay').text(declOfNum(durability));
                    $('#amountUnitAreaUpdate').attr('data-amount-unit', valOfMeters);
                }
            });
        }
    });

    //к чату и обратно
    $('body').on("click", ".modal-edit__thumbler", function () {

        if ( $('.chat').css('display') == 'none' ) {
            console.log('показать чат');

            // $('.modal-edit__main').hide();
            $('.chat').show();
            $('.modal-edit__to-chat').text('К работе');
            $('.modal-edit').css('overflow-y', 'unset');
            $('.modal-edit__main').css('overflow-y', 'hidden');
            $('.modal-edit__wrapper').css('overflow-y', 'unset');
            // $('.modal-edit__chat-btn-img').attr("src", "/img/theme/icons/arrow/arrow-down-solid.svg");
        }

        else if ( $('.chat').css('display') == 'block' ) {

            console.log('показать модалку работы');
            console.log('показать модалку работы');
            $('.chat').hide();
            $('.modal-edit').css('overflow-y', 'scroll');
            $('.modal-edit__main').css('overflow-y', 'scroll');

            $('.modal-edit__wrapper').css('overflow-y', 'scroll');
            $('.modal-edit__to-chat').text('К чату');
            // $('.modal-edit__chat-btn-img').attr("src", "/img/theme/icons/arrow/arrow-up-solid.svg");
            $('.modal-edit__main').show();
        }
    });

    //Включение и выключение опций работы ("Избранное", "Скрытая работа", "Простой")
    $('body').on("click", ".modal-edit__option-icon", function (e) {

        var workId = parseInt($('#modalEditId').text());
        var rightsCreate = userRights.work_create_change_right;
        var rightsChange = userRights.change_sequence_and_durability;

        if (workId) {

            var optionName = $(this).data('option-name-edit');

            //Модалка редактирования
            var optionUrl = "/change-work-" + optionName + "/" + window.project_id + "/" + workId;

            switch (optionName) {

                case 'subscription':

                    $.ajax({

                        type: "POST",
                        url: optionUrl,

                        success: function (data) {

                            var checkbox = $('#hiddenModalBanInput');
                            data = JSON.parse(data);

                            if (data) {

                                //включаем
                                checkbox.prop('checked', true);
                                toggleWorkIcon(optionName, true, 'edit', workId);
                            } else {

                                //отключаем
                                checkbox.prop('checked', false);
                                toggleWorkIcon(optionName, false, 'edit', workId);
                            }
                        }
                    });
                    break;

                case 'hidden':

                    if (rightsCreate != 0) {

                        $.ajax({

                            type: "POST",
                            url: optionUrl,

                            success: function (data) {

                                var checkbox = $('#hidden-modal-ban-input');
                                data = JSON.parse(data);

                                if (data) {

                                    //включаем
                                    checkbox.prop('checked', true);
                                    toggleWorkIcon(optionName, true, 'edit', workId);
                                } else {

                                    //отключаем
                                    checkbox.prop('checked', false);
                                    toggleWorkIcon(optionName, false, 'edit', workId);
                                }
                            }
                        });
                    }

                    else {

                        e.preventDefault();

                        var alertText = "Менять значение может только: <br>" + allUsersRights.work_create_change_right;

                        showAlertModal(alertText, modalAlertCancelCreated, 'overlay-mini');
                    }

                    break;

                case 'blocked':

                    if (rightsChange != 0) {

                        $.ajax({

                            type: "POST",
                            url: optionUrl,

                            success: function (data) {

                                var checkbox = $('#hidden-modal-ban-input');
                                var blockCount = Number($('#ban-count').text());
                                var workCount = Number($('#in-work-count').text());

                                data = JSON.parse(data);

                                if (data) {

                                    //включаем
                                    checkbox.prop('checked', true);
                                    toggleWorkIcon(optionName, true, 'edit', workId);
                                    blockCount += 1;
                                    workCount -= 1;

                                    $('#ban-count').text(blockCount);
                                    $('#in-work-count').text(workCount);

                                    makeInWorkCardExpiredDesign(workId, false);

                                } else {

                                    //отключаем
                                    checkbox.prop('checked', false);
                                    toggleWorkIcon(optionName, false, 'edit', workId);
                                    blockCount -= 1;
                                    workCount += 1;

                                    $('#in-work-count').text(workCount);

                                    if (blockCount >= 0) {

                                        $('#ban-count').text(blockCount)
                                    }

                                    if (isDateInWorkExpired(workId)) {

                                        makeInWorkCardExpiredDesign(workId, true);
                                    }
                                }
                            }
                        });
                    }
                    else {

                        e.preventDefault();
                        var alertText = "Менять значение может только: <br>" + allUsersRights.change_sequence_and_durability;
                        showAlertModal(alertText, modalAlertCancelCreated, 'overlay-mini');
                    }

                break;
            }

        }

        if (!workId) {

            var optionName = $(this).data('option-name-create');

            switch (optionName) {

                case 'subscription':

                    var checkbox = $('#hidden-modal-checkbox');

                    if (checkbox.prop('checked')) {

                        checkbox.prop('checked', false);

                        toggleWorkIcon('subscription', false, 'create');
                    } else {

                        //отключаем
                        checkbox.prop('checked', true);

                        toggleWorkIcon('subscription', true, 'create');
                    }
                    break;

                case ('hidden'):

                    var checkbox = $('#hidden-modal-work-input');

                    if (checkbox.prop('checked')) {

                        checkbox.prop('checked', false);

                        toggleWorkIcon('hidden', false, 'create');
                    } else {

                        checkbox.prop('checked', true);

                        toggleWorkIcon('hidden', true, 'create');
                    }
                    break;
            }

        }
    });

    //функция включения и выключения иконок
    function toggleWorkIcon(iconName, toggleOn = true, modalType, workId) {

        //Для модалки создания работы
        if (modalType == 'create') {

            var icon = $('[data-option-name-create="' + iconName + '"]').find('i');

            switch (iconName) {

                case 'subscription':

                    if (toggleOn) {

                        icon
                            .removeClass('far')
                            .addClass('fas')
                            .addClass('star');
                        //также нужно включить на канбане

                    } else {

                        icon
                            .removeClass('star')
                            .removeClass('fas')
                            .addClass('far');
                    }
                    break;

                case 'hidden':

                    if (toggleOn) {

                        icon
                            .addClass('fiol-digit');
                    } else {

                        icon
                            .removeClass('fiol-digit');
                    }
                    break;
            }
        }

        //Для модалки редактирования работы
        if (modalType == 'edit') {

            var icon = $('[data-option-name-edit="' + iconName + '"]').find('i');

            switch (iconName) {

                case 'subscription':
                    var workIcon = $('[data-work-id="' + workId + '"]').find('.kanban-card__star-block');

                    if (toggleOn) {

                        icon
                            .removeClass('far')
                            .addClass('fas')
                            .addClass('star');
                        //также нужно включить на канбане
                        workIcon.show();

                    } else {

                        icon
                            .removeClass('star')
                            .removeClass('fas')
                            .addClass('far');
                        workIcon.hide();
                    }
                    break;

                case 'hidden':

                    var workIcon = $('[data-work-id="' + workId + '"]').find('.kanban-card__eye-block');
                    if (toggleOn) {

                        icon
                            .addClass('fiol-digit');
                        workIcon.show();
                    } else {

                        icon
                            .removeClass('fiol-digit');
                        workIcon.hide();
                    }
                    break;

                case 'blocked':

                    var workIcon = $('[data-work-id="' + workId + '"]').find('.kanban-card__ban-icon');

                    if (toggleOn) {

                        icon
                            .addClass('red-digit');
                        workIcon.show();
                    } else {

                        icon
                            .removeClass('red-digit');
                        workIcon.hide();
                    }
            }
        }
    };

    //Расчёт стоимости в главной модалке
    $('.modal-edit__main').on('input', function () {

        var amount = $("#val-area").val();
        var price = $("#price-area").val();
        var sale = $("#sale-area").val();
        var ceiled = livePriceCalculation(amount, price, sale);

        if (!isNaN(parseFloat(ceiled))) {

            $('#total-summ').html(ceiled);
        } else {

            $('#total-summ').html('');
        }
    });

    //ajax запрос создания карточки работы
    $("#modalEditCreate").submit(function (event) { //Событие, которое срабатывает при отправке формы

        event.preventDefault();

        $('#modalEditInput').hide();

        selected = $('#amount-unit-area option:selected').text();
        var form_data = $(this).serializeArray(); //собераем все данные из формы //Эквивалентно записи  var form_data = $(".edit-modal__form-block").serialize();

        url = "/create-work/" + window.project_id; //Создание карточки

        form_data.push({name: "state", value: 3}); //При создании карточки она помещается в "Запланированные", чему соответствует номер состояния "3"

        $.ajax({
            type: "POST", //Метод отправки
            url: url, //для создания карточки
            data: form_data, //Здесь массив данных, собранных с формы с помощью serialize() в формате json

            success: function (data) {

                createModalClose();

                var parsedData = JSON.parse(data);
                var valOfMeters = parsedData.amount_unit;

                if (!parsedData.allowed) {

                    //showAlertModal('Ошибка доступа! Пожалуйста, перезагрузите страницу', modalAlertDeactivated, 'overlay-mini');
                    return false;
                }

                switch (parseInt(valOfMeters)) {

                    case 0:

                        amount_unit = "м";

                        break;

                    case 1:

                        amount_unit = "м <sup>2</sup>";

                        break;

                    case 2:

                        amount_unit = "м <sup>3</sup>";

                        break;

                    case 3:

                        amount_unit = "м\\пог";

                        break;

                    case 4:

                        amount_unit = "шт";

                        break;

                    case 5:

                        amount_unit = "компл";

                        break;
                }

                calculatedPriceSuccess = calculatePrice(window.project_id, parsedData.work_num);

                calculatedPriceSuccess.done(function () {

                    calculatedPrice = JSON.parse(calculatedPriceSuccess.responseText);

                    if (calculatedPrice == 0) {

                        calculatedPrice = '0';
                    }

                    transfer = getWorkCardHtml(parsedData.work_num, parsedData.name, parsedData.amount, amount_unit, parsedData.price, parsedData.sale, calculatedPrice, parsedData.durability, parsedData.subscription, parsedData.is_hidden_work);

                    $('[data-href="3"]').append(transfer);

                    recalc();
                });
            },

            error: function (error) {
                if (error.responseJSON.errors.hasOwnProperty('sale')) {

                }
            }
        });

    });

    //рассчет стоимости при создании модалки работы
    function calculatePrice(projectId, workId) {

        return $.ajax({

            type: "POST",
            url: "/calculate-price/" + projectId + '/' + workId,
        });
    }

    //Динамическое создание карточки работы для добавления или замены аяксом
    function getWorkCardHtml(work_num, name, amount, amount_unit, price, sale, calculatedPrice, durability, subscription, isHiddenWork) {

        if (!durability) {

            durability = ' - ';
        }

        if (!sale) {

            sale = '';
            minus = '';
            persent = '';
        }
        else {

            minus = '-';
            persent = '%';
        }

        price = numberFormatWithSpaces(price);
        amount = numberFormatWithSpaces(amount);
        calculatedPrice = numberFormatWithSpaces(calculatedPrice);

        if (subscription == '0') {

            showHideStar = 'style="display:none"';
        } else {

            showHideStar = '';
        }

        if (isHiddenWork == '0') {

            showHideEye = 'style="display:none"';
        } else {

            showHideEye = '';
        }

        if ($('.fas.fa-toggle-on.breadcrumbs__detail-img').css('display') == 'none') {

            tempStyle = 'none';
        }
        else {

            tempStyle = 'flex';
        }

        var transfer = '<div class="kan-card portlet" id="card-' + work_num + '" data-work-id="' + work_num + '">\n' +
            '                                         <div class="kanban-card ui-sortable-handle portlet-header">\n' +
            '                                            <div class="kanban-card__inside-block">\n' +
            '                                                <div class="kanban-card__inside-block">\n' +
            '                                                    <div class="kanban-card__desc-block">\n' +
            '                                                        <div class="kanban-card__first-row">\n' +
            '                                                            <div class="kanban-card__check-block">\n' +
            '                                                                <label class="checkbox-label">\n' +
            '                                                                    <input class="checkbox-label__checxbox-input temp-check" type="checkbox" style="box-shadow: none;">\n' +
            '                                                                    <span class="checkbox-label__checxbox-span grey-spn"></span>\n' +
            '                                                                </label>\n' +
            '                                                            </div>\n' +
            '                                                            <div class="kanban-card__title-block">\n' +
            '                                                                <div class="kanban-card__title">\n' +
            '                                                                            <span class="kanban-card__id">\n' +
            '                                                                                <span class="card-id">' + work_num + '</span>\n' +
            '                                                                            </span>\n' +
            '                                                                    <span class="kanban-card__title-desc">' + name + '</span>\n' +
            '                                                                </div>\n' +
            '                                                            </div>\n' +
            '                                                        </div>\n' +
            '                                                        <div class="kanban-card__third-row">\n' +
            '                                                            <div class="kanban-card__left-group">\n' +
            '                                                                <div class="kanban-card__amount-block">\n' +
            '                                                                    <div class="kanban-card__amount-title-block">\n' +
            '                                                                        <div class="kanban-card__amount-title">Кол-во</div>\n' +
            '                                                                    </div>\n' +
            '                                                                    <div class="kanban-card__amount-val-block">\n' +
            '                                                                        <div class="kanban-card__amount-val">' + amount + '</div>\n' +
            '                                                                        <div class="kanban-card__amount-ei">' + amount_unit + '</div>\n' +
            '                                                                    </div>\n' +
            '                                                                </div>\n' +
            '                                                                <div class="kanban-card__price-block">\n' +
            '                                                                    <div class="kanban-card__price-title-block">\n' +
            '                                                                        <div class="kanban-card__price-title">Цена/ед.</div>\n' +
            '                                                                    </div>\n' +
            '                                                                    <div class="kanban-card__price-val-block">\n' +
            '                                                                        <div class="kanban-card__price-val">\n' + price + '</div>\n' +
            '                                                                        <div class="kanban-card__price-ei">' + minus + '\n' +
            '                                                                            <span class="card__persent">' + sale + '</span>' + persent + '\n' +
            '                                                                        </div>\n' +
            '                                                                    </div>\n' +
            '                                                                </div>\n' +
            '                                                                <div class="kanban-card__cost-block">\n' +
            '                                                                    <div class="kanban-card__cost-title-block">\n' +
            '                                                                        <div class="kanban-card__cost-title">Σ Стоимость</div>\n' +
            '                                                                    </div>\n' +
            '                                                                    <div class="kanban-card__cost-val-block">\n' +
            '                                                                        <div class="kanban-card__cost-val">' + calculatedPrice + '</div>\n' +
            '                                                                    </div>\n' +
            '                                                                </div>\n' +
            '                                                                <div class="kanban-card__limit-block">\n' +
            '                                                                    <div class="kanban-card__limit-title-block">\n' +
            '                                                                        <div class="kanban-card__limit-title">Срок</div></div>\n' +
            '                                                                    <div class="kanban-card__limit-values">\n' +
            '                                                                        <div class="kanban-card__limit-values"><div class="kanban-card__limit-total-val canceled-val">' + durability + '</div>\n' +
            '<div class="kanban-card__limit-right-bracket">дн.</div></div>\n' +
            '                                                                    </div>\n' +
            '                                                                </div>\n' +
            '                                                            </div>\n' +
            '                                                        </div>\n' +
            '                                                    </div>\n' +
            '                                                    <div class="kanban-card__icon-block">\n' +
            '                                                        <div class="kan-card-mini-block kanban-card__star-block">\n' +
            '                                                            <i class="fas fa-star star-kan" ' + showHideStar + '>\n' +
            '                                                            </i>\n' +
            '                                                           <span class="popup-left-icon" style="">Избранная работа</span>\n' +
            '                                                        </div>\n' +
            '                                                        <div class="kan-card-mini-block kanban-card__eye-block">\n' +
            '                                                            <i class="fas fa-eye-slash fiol-digit" ' + showHideEye + '></i>\n' +
            '                                                           <span class="popup-left-icon" style="">Скрытая работа</span>\n' +
            '                                                        </div>\n' +
            '                                                        <div class="kan-card-mini-block kanban-card__mail-block" style="display: none">\n' +
            '                                                           <i class="fas fa-envelope mail-icon"></i>\n' +
            '                                                            <span class="popup-left-icon" style="">Новое сообщение</span>\n' +
            '                                                        </div>\n' +
            '                                                        <div class="kan-card-mini-block kanban-card__i-block">\n' +
            '                                                            <i class="fas fa-info-circle i-icon" style="display:none"></i>\n' +
            '                                                            <span class="popup-left-icon" style="">Новое изменение</span>\n' +
            '                                                        </div>\n' +
            '                                                           <div class="kan-card-mini-block kanban-card__ban-icon">\n' +
            '                                                    </div>\n' +
            '                                                </div>\n' +
            '                                            </div>\n' +
            '                                            <div class="progress-bar--bar--line">\n' +
            '                                                <div style="width: 70%" class="progress-bar--bar--segment  green-kan"></div>\n' +
            '                                                <div class="progress-bar--bar--segment orange-kan"></div>\n' +
            '                                            </div>\n' +
            '                                            <div class="kanban-card__info-block-main">\n' +
            '                                                <div class="kanban-card__info-block">\n' +
            '                                                    <div class="kanban-card__left-info-block">\n' +
            '                                                        <div class="kanban-card__info-title">оплачено</div>\n' +
            '                                                        <div class="kanban-card__info-paid">98 999 999</div>\n' +
            '                                                    </div>\n' +
            '                                                    <div class="kanban-card__right-info-block">\n' +
            '                                                        <div class="kanban-card__info-title">остаток</div>\n' +
            '                                                        <div class="kanban-card__info-balance">98 999 999</div>\n' +
            '                                                    </div>\n' +
            '                                                </div>\n' +
            '                                            </div>\n' +
            '                                        </div>\n' +
            '                                    </div>';

        if ($('.fas.fa-toggle-off.breadcrumbs__img.off:visible')) {

            tempStyle = 'none';
        }

        return transfer;
    }

    //слайдер модалок
    //вправо
    $('body').on('click', '.modal-edit__right-arrow', function (e) {

        var workId = $('#modalEditId').html();
        $('.preloader-block, #overlay-slider').show();

        workModalClose('modalEdit', '.modal-edit__close-modal', 'overlay');

        $("#card-" + workId + "").next('.kan-card').find('.kanban-card').trigger('click');
    });

    //влево
    $('body').on('click', '.modal-edit__left-arrow', function (e) {

        var workId = $('#modalEditId').html();
        $('.preloader-block, #overlay-slider').show();

        workModalClose('modalEdit', '.modal-edit__close-modal', 'overlay');

        $("#card-" + workId + "").prev('.kan-card').find('.kanban-card').trigger('click');
    });

    //Функция перекраски кнопки
    function inputChangeBtnEnabledTextArea() {

        var lastHistoryVal = $('#historyBody').find('.modal-history__history-row:last-child').find('.modal-history__history-desc').text();

        //очищаем все буквы из текстового поля чтобы получить цифры
        var historyValWithousSymbols = lastHistoryVal; //последняя строка истории обжатая
        var newInputDataHistory = $('.modal-history__last-value').val(); //введеное значение в инпуте

        if (historyValWithousSymbols === newInputDataHistory) {

            $('.modal-history__btn-save').addClass("diabled-button").css('pointer-events', 'none');
        }
        else {

            $('.modal-history__btn-save').removeClass("diabled-button").css('pointer-events', 'unset');
        }
    }

    function inputChangeBtnEnabled() {

        var lastHistoryVal = $('#historyBody').find('.modal-history__history-row:last-child').find('.modal-history__history-desc').text();

        //очищаем все буквы из текстового поля чтобы получить цифры
        var historyValWithousSymbols = lastHistoryVal.replace(/[^-0-9]/gim, ''); //последняя строка истории обжатая
        var newInputDataHistory = $('.modal-history__last-value').val(); //введеное значение в инпуте

        if (historyValWithousSymbols === newInputDataHistory) {

            $('.modal-history__btn-save').addClass("diabled-button").css('pointer-events', 'none');
        }
        else {

            $('.modal-history__btn-save').removeClass("diabled-button").css('pointer-events', 'unset');
        }
    }

    //разблокировка кнопки везде, кроме инпута с селектом в модалке количество
    $('body').on('input change', '.modal-history__last-value:not(#valAmountHistoryInput)', function () {

        inputChangeBtnEnabled();
    });

    $('body').on('input change', '.modal-history__textarea:not(#valAmountHistoryInput)', function () {

        inputChangeBtnEnabledTextArea();
    });

    //разблокировка кнопки инпута с селектом в модалке количество
    $('body').on('input change', '#valAmountHistoryInput, #valAmountHistory', function () {

        //забираем значение селекта
        var textOfSelect = $('#valAmountHistory option:selected').text();

        textOfSelect = textOfSelect.replace(/\s/g, "");

        console.log(textOfSelect);

        var lastHistoryVal = $('#historyBody').find('.modal-history__history-row:last-child').find('.modal-history__history-desc').text();

        console.log(lastHistoryVal);

        var lastHistoryValSplited = lastHistoryVal.split(' ');

        console.log(lastHistoryValSplited);

        // var lastHistoryVal = $('#historyBody').find('.modal-history__history-row:last-child').find('.modal-history__history-desc').text();

        //очищаем все буквы из текстового поля чтобы получить цифры
        var historyValWithousSymbols = lastHistoryVal.replace(/[^-0-9]/gim, ''); //последняя строка истории обжатая

        console.log(historyValWithousSymbols);


        var newInputDataHistory = $('.modal-history__last-value').val(); //введеное значение в инпуте

        console.log(newInputDataHistory);

        if (historyValWithousSymbols === newInputDataHistory && lastHistoryValSplited[1] == textOfSelect) {

            console.log('none');

            $('.modal-history__btn-save').addClass("diabled-button").css('pointer-events', 'none');
        }
        else {

            console.log('unset');
            $('.modal-history__btn-save').removeClass("diabled-button").css('pointer-events', 'unset');
        }
    });

    //смена стрелкой вверх в модалке истории плановой длительности
    $('body').on('click', '.modal-history__triangle-up', function (e) {

        //значение инпута по загрузке страницы
        var modalHistoryInput = $('#plannedDurationHistory').val();

        if (modalHistoryInput != '') {

            modalHistoryInput++;
            $('#plannedDurationHistory').val(modalHistoryInput);
        }
        else if (modalHistoryInput == '') {

            $('#work-checkbox').prop('checked', false);
            $('#plannedDurationHistory').val('1');
            $('#plannedDurationHistory').css('background-color', 'white');
            $('#plannedDurationHistory').removeAttr("disabled").prop('required', true);
        }

        inputChangeBtnEnabled();
    });

    //смена стрелкой вниз в модалке истории плановой длительности
    $('body').on('click', '.modal-history__triangle-down', function (e) {

        //значение инпута по загрузке страницы
        var modalHistoryInput = parseInt($('#plannedDurationHistory').val());
        var plannedDurationModal = $('#plannedDuration').text().trim();

        if ((modalHistoryInput != '') && (modalHistoryInput != 1) && (modalHistoryInput)) {

            modalHistoryInput--;
            $('#plannedDurationHistory').val(modalHistoryInput);
            inputChangeBtnEnabled();
        }
        else if (modalHistoryInput == 1 && plannedDurationModal != '-') {

            $('#plannedDurationHistory').val('');
            $('#work-checkbox').prop('checked', true);
            $('#plannedDurationHistory').css('background-color', '#f5f5f5');
            $('#plannedDurationHistory').removeAttr("required").attr('disabled', 'disabled');
        }

        else if (modalHistoryInput == 1 && plannedDurationModal == '-') {

            $('#plannedDurationHistory').css('background', '#f5f5f5');
            $('#work-checkbox').prop('checked', true);
            $('#plannedDurationHistory').val('');
            $('#plannedDurationHistory').removeAttr("required").attr('disabled', 'disabled');
            $('.modal-history__btn-save').addClass("diabled-button").css('pointer-events', 'none');
        }
    });

    //checkbox datepicker в истории
    $('body').on('change', '#datePickerCheckbox', function (e) {

        if ($('#datePickerCheckbox').prop('checked') == true) {

            $('#datePickerHistory').css('background', '#f5f5f5').val('');
            $('#datePickerHistoryHidden').val('');
            $('.modal-history__btn-save').removeClass("diabled-button").css('pointer-events', 'unset');
            $("#datePickerHistory").datepicker("destroy");
        }
        else if ($('#datePickerCheckbox').prop('checked') == false) {

            $('#datePickerHistory').val('').css('background-color', 'white');
            $('.modal-history__btn-save').addClass("diabled-button").css('pointer-events', 'none');
            $('#datePickerHistory').datepicker({dateFormat: 'dd M', minDate: 0});
        }
    });

    //checkbox plannedDuration в истории
    $('body').on('change', '#work-checkbox', function (e) {

        var plannedDurationModal = $('#plannedDuration').text().trim();

        if ($('#work-checkbox').prop('checked') == true && (plannedDurationModal != '-')) {

            $('#plannedDurationHistory').css('background', '#f5f5f5');
            $('#plannedDurationHistory').val('');
            $('#plannedDurationHistory').removeAttr("required").attr('disabled', 'disabled');
            $('.modal-history__btn-save').removeClass("diabled-button").css('pointer-events', 'unset');
        }
        else if ($('#work-checkbox').prop('checked') == false) {

            $('#plannedDurationHistory').removeAttr("disabled").prop('required', true);
            $('#plannedDurationHistory').val('').css('background-color', 'white');
            $('.modal-history__btn-save').addClass("diabled-button").css('pointer-events', 'none');
        }

        else if (($('#work-checkbox').prop('checked') == true) && (plannedDurationModal == '-')) {

            $('#plannedDurationHistory').css('background', '#f5f5f5');
            $('#plannedDurationHistory').val('');
            $('#plannedDurationHistory').removeAttr("required").attr('disabled', 'disabled');
            $('.modal-history__btn-save').addClass("diabled-button").css('pointer-events', 'none');
        }
    });

    //datepicker в истории
    $('body').on('change', '#datePickerHistory', function (e) {

        var myDate = $('#datePickerHistory').datepicker('getDate');
        // console.log(myDate); //дату которую выбрали необжатую
        var modalBegin = $('#workStart').text().trim();
        // console.log(modalBegin);//дата  предыдущего планового завершения ввиде строки
        var modalBeginsplit = modalBegin.split(' ');
        // console.log(modalBeginsplit);//дата  предыдущего планового завершения ввиде массива
        var modalBeginsplitDay = parseInt(modalBeginsplit[0]);
        // console.log(modalBeginsplitDay);//дата день  предыдущего планового завершения ввиде строки
        var modalBeginMonth = modalBeginsplit[1];
        // console.log(modalBeginMonth); //дата предыдущего планового завершения месяц ввиде строки

        switch (modalBeginMonth) {
            case 'янв':
                modalBeginMonth = '1';
                break;
            case 'фев':
                modalBeginMonth = '2';
                break;
            case 'мар':
                modalBeginMonth = '3';
                break;
            case 'апр':
                modalBeginMonth = '4';
                break;
            case 'май':
                modalBeginMonth = '5';
                break;
            case 'июн':
                modalBeginMonth = '6';
                break;
            case 'июл':
                modalBeginMonth = '7';
                break;
            case 'авг':
                modalBeginMonth = '8';
                break;
            case 'сен':
                modalBeginMonth = '9';
                break;
            case 'окт':
                modalBeginMonth = '10';
                break;
            case 'ноя':
                modalBeginMonth = '11';
                break;
            case 'дек':
                modalBeginMonth = '12';
                break;
            default:
                modalBeginMonth = '1';
        }

        var thisYear = new Date().getFullYear();
        // console.log(thisYear);//этот год

        var dateCreate = new Date(thisYear, modalBeginMonth - 1, modalBeginsplitDay);
        // console.log(dateCreate);//последняя дата перемещениея из истории в стадию в работе в необжатом формате

        var dateToday = new Date(myDate);
        // console.log(dateToday);//дату которую выбрали необжатую - дубль myDate !!!!!

        var differenceDate = (dateToday.getTime() - dateCreate.getTime()) / (1000 * 3600 * 24) + 1; //сюда подставить секунды прошедшие с начала месяца вместо date1.getTime()
        // console.log(differenceDate); //дата которую выбрали минус последняя дата перемещениея из истории в стадию в работе в необжатом формате

        var datePickerVal = $('#datePickerHistory').val().trim();

        if (differenceDate > 0) {

            $("#datePickerHistoryHidden").val(differenceDate);
        }

        if (modalBegin == datePickerVal) {

            $("#datePickerHistoryHidden").val('1');
        }

        if (datePickerVal == modalBegin) {

            $('.modal-history__btn-save').addClass("diabled-button").css('pointer-events', 'none');
        }
    });

    //закрытие по ESC
    $(document).on('keyup', hideModal);
    function hideModal(e) {

        if(e.keyCode === 27) {

            console.log( $("div").is(".modal-history__history-row") );

            if ( $('#stateAreaUpdate').is(':visible') && ($('.modal-history__history-row').is(':visible')) ) {
                console.log('2');
                // $('.modal-history__history-row:visible').closest('#modalHistory').find('.modal-history__close-history-modal').trigger( "click" );
                $( ".modal-history__close-history-modal" ).trigger( "click" );
            }

            else if ( !($("div").is(".modal-history__history-row")) ) {
                console.log('3');
                $( ".modal-edit__close-modal" ).trigger( "click" );
            }

            if ( $('#modalEditInput').is(':visible') ) {

                $( ".modal-edit__close-input-modal" ).trigger( "click" );
            }

            if ($('.time-modal').is(':visible')) {
                $( ".close-time-modal" ).trigger( "click" );
            }

            if ($('.time-modal-wide').is(':visible')) {
                $( ".close-time-modal" ).trigger( "click" );
            }

            if ($('.time-modal-tiny').is(':visible')) {
                $( "#close" ).trigger( "click" );
            }
        }
    };

    //отправка формы из полей истории
    $('#historyForm').submit(function (e) {

        e.preventDefault();
        // $('#overlay-history, .preloader-block').show();
        var thisAttr = $(this).attr('data-modal-id');
        console.log(thisAttr);
        submitHistoryModal(thisAttr);
    });

    //функция отправки формы истории
    function submitHistoryModal(fieldName){

        var workId = parseInt( $("#modalEditId").text() );
        var values = {};

        $.each($("#historyForm").data("data-modal-id", + fieldName).serializeArray(), function(i, field) {

            values[field.name] = field.value;
        });

        newFieldValue = values[fieldName];

        endDateVal = $('.picker-input').val();

        if (endDateVal == ''){

            endDateVal = '-';
        }

        if (fieldName == 'amount'){

            var amountUnit = values['amount-unit'];
        }

        historyAjaxSuccess = historyAjax(window.project_id, workId, "save-to-history", fieldName, newFieldValue, amountUnit);

        historyAjaxSuccess.fail(function (error) { ///???

            openHistoryModal('sale');
        });

        historyAjaxSuccess.done(function () {

            switch (fieldName){

                case ("name"):

                    fieldClass = '.kanban-card__title-desc';

                    break;

                case ("extra"):

                    fieldClass = '.kanban-card__extra-desc';

                    break;

                case ("amount"):

                    fieldClass = '.kanban-card__amount-val';

                    $('[data-work-id="' + workId + '"').find('.kanban-card__amount-ei').html(getAmountUnit(amountUnit));

                    break;

                case ("price"):

                    fieldClass = '.kanban-card__price-val';

                    break;

                case ("sale"):

                    fieldClass = '.card__persent';

                    break;

                case ("durability"):

                    fieldClass = '.edit-modal__val-days';

                    break;

                default:

                    fieldClass = '';

                    break;
            }

            if (fieldName == "price" || fieldName == "amount"){

                newFieldValue = numberFormatWithSpaces(newFieldValue);
                newFieldValue = newFieldValue.replace('.', ',');
            }

            $('[data-work-id="' + workId + '"]').find(fieldClass).text(newFieldValue);

            console.log(newFieldValue);
            console.log(fieldClass);

            if (fieldName == "amount") {

                newFieldValue = newFieldValue.replace('.', ',');
                $('#kan-card__amount-desc-val').text(newFieldValue);
                $('#valAreaUpdate').text(newFieldValue);
                $('#amountUnitAreaUpdate').attr("data-amount-unit", amountUnit).html(getAmountUnit(amountUnit));
                $('[data-work-id="' + workId + '"]').find('.kan-card__amount-desc-desc').html(getAmountUnit(amountUnit));
            } else if(fieldName == "work") {

            if (!newFieldValue || newFieldValue ==''){
                newFieldValue = '-';
            }

            $('#plannedDurationDay').html(declOfNum(newFieldValue));
            $('#plannedDuration').text(newFieldValue);
            console.log(newFieldValue);

            //var end_date = getEndDate(parseData.start_state_date, parseData.durability);

                console.log(endDateVal);



            $('#plannedComplete').text(endDateVal);

            // $('.edit-modal__val-days').removeClass('end-date-lighted');
            $('#card-' + workId).find('.portlet-header').removeClass('card-red-border-in-work');
            // $('#overlay-history, .preloader-block').hide();
            } else {

                $('.' + fieldName + '-area-update').text(newFieldValue);
                // $('#overlay-history, .preloader-block').hide();
            }
        });

        calculatedPriceSuccess = calculatePrice(window.project_id, workId);
        //START Расчёт суммы
        if (fieldName == 'amount'){

            var amount = $('#valAmountHistoryInput').val();
        }
        else {

            var amount = $("#valAreaUpdate").text();
        }

        if (fieldName == 'price'){

            var price = $("#PriceHistory").val();
        }
        else {

            var price = $("#priceAreaUpdate").text();
        }

        if (fieldName == 'sale'){

            var sale = $("#saleHistory").val();

            if (sale > 0) {

                $('body').find("#card-" + workId + "").find('.percent-line').text('-');
                $('body').find("#card-" + workId + "").find('.percent-symbol').text('%');
            }
        }
        else {

            var sale = $("#saleAreaUpdate").text();
            // console.log(sale);
        }

        calculatedPriceSuccess.done(function(){

            var ceiled = livePriceCalculation( amount, price, sale );
            console.log(ceiled);
            $('[data-work-id="' + workId + '"]').find('.kanban-card__cost-val').html(ceiled);
            $('#totalSumm').html(ceiled);
            $('#overlay-history').hide();
            recalc();
        });

        $('.modal-history__close-history-modal').trigger('click');
        $('#overlay-history').show();
    }

////////////////////////////////////////

    //Получаем данные о создателе проекта в виде текста
    function getProjectCreatorProps() {
        var projectCreatorPropsText = projectCreator.name + ' ' + projectCreator.lastname;
        if (projectCreator.hasOwnProperty('phone_1') && projectCreator.phone_1) {
            if (projectCreator.phone_1.length > 0) {
                projectCreatorPropsText += '<br><span>' + projectCreator.phone_1 + '</span>';
            }
        }
        if (projectCreator.hasOwnProperty('phone_2') && projectCreator.phone_2) {
            if (projectCreator.phone_2.length > 0) {
                projectCreatorPropsText += '<br><span>' + projectCreator.phone_2 + '</span>';
            }
        }
        projectCreatorPropsText += '<br>' + projectCreator.email + '<br>';
        return projectCreatorPropsText;
    }

    //Получаем данные о создателе проекта в виде текста с аватаркой
    function getProjectCreatorPropsAva() {
        var projectCreatorPropsText = '<i style="cursor: default" class="fas fa-user-circle user-modal-avatar"></i>' + ' ' + '<span class="time-modal-tiny__role-fullname">' + projectCreator.name + ' ' + projectCreator.lastname + '</span>';
        if (projectCreator.hasOwnProperty('role_name')) {
            projectCreatorPropsText += '<span class="time-modal-tiny__role-name">' + projectCreator.role_name + '</span>';
        }
        if (projectCreator.hasOwnProperty('phone_1') && projectCreator.phone_1) {
            if (projectCreator.phone_1.length > 0) {
                projectCreatorPropsText += '<span class="time-modal-tiny__role-phone">' + projectCreator.phone_1 + '</span>';
            }
        }
        if (projectCreator.hasOwnProperty('phone_2') && projectCreator.phone_2) {
            if (projectCreator.phone_2.length > 0) {
                projectCreatorPropsText += '<span class="time-modal-tiny__role-phone">' + projectCreator.phone_2 + '</span>';
            }
        }
        projectCreatorPropsText += '<span class="time-modal-tiny__role-email">' + projectCreator.email + '</span>';
        return projectCreatorPropsText;
    }

    //подтверждение изменения формы в модалке при переносе в стадию в работе
    $(".time-modal-wide__form-block").submit(function (event) {
        event.preventDefault();
        var durability = $("#time-modal-wide__input").val();
        if (durability == '' || durability == 0) {
            durability = 'none'
        }
        ;
        var workId = parseInt($('.hidden-time-input').text());
        $('#label-time-checkbox-wide').trigger('input');
        //оранжевый перелив
        $("[data-work-id='" + workId + "']").find('.portlet-header').css('background-image', 'none');
        $('.time-modal-wide').hide();
        $('.preloader-block').show();

        $.ajax({
            type: "POST",
            url: "/get-and-save-durability/" + window.project_id + "/" + workId,
            data: {
                "save": durability,
                "state": $("[data-work-id='" + workId + "']").closest('.kanban__column-kan-block').data('href')
            },
            success: function (data) {
                $('[data-work-id="' + workId + '"]').find('.kanban-card__limit-values').html(data);
                $('#overlay-sort, .time-modal-wide').hide();
            }
        });
    });

    //подтверждение изменения формы в модалке при переносе в стадию запланированные
    $(".time-modal__form-block").submit(function (event) {
        event.preventDefault();
        var durability = $("#time-modal__input").val();
        if (durability == '' || durability == 0) {
            durability = 'none'
        }
        ;
        var workId = parseInt($('.hidden-time-input-tiny').text());
        $('#label-time-checkbox').trigger('input');
        $("[data-work-id='" + workId + "']").find('.portlet-header').css('background-image', 'none');
        $('.time-modal').hide();
        $('.preloader-block').show();
        $.ajax({
            type: "POST",
            url: "/get-and-save-durability/" + window.project_id + "/" + workId,
            data: {
                "save": durability,
                "state": $("[data-work-id='" + workId + "']").closest('.kanban__column-kan-block').data('href')
            },
            success: function (data) {
                $('[data-work-id="' + workId + '"]').find('.kanban-card__limit-values').html(data);
                $('#overlay-sort, .time-modal').hide();
            }
        });
    });

    //склонение дней в модалках
    function declOfNum(daysModalVal) {
        titles = ['день', 'дня', 'дней'];
        cases = [2, 0, 1, 1, 1, 2];
        return titles[(daysModalVal % 100 > 4 && daysModalVal % 100 < 20) ? 2 : cases[(daysModalVal % 10 < 5) ? daysModalVal % 10 : 5]];
    }

    //Проверка на фронтенде, просрочена ли карточка работы в стадии "В работе"
    function isDateInWorkExpired(cardId) {
        //Получаем дату завершения карточки
        var card = $('#card-' + cardId);
        var endDayText = card.find('.kanban-card__limit-date-end').html();
        var endMonthText = card.find('.kanban-card__limit-month-end').html();
        //Сравниваем с текущей, чтобы узнать, просрочена ли она
        var nowDate = new Date();
        var endDate = new Date(endDayText + ' ' + rusToEngMonth(endMonthText) + ' ' + nowDate.getFullYear());
        if (nowDate.getDate() == endDate.getDate() && nowDate.getMonth() == endDate.getMonth() && nowDate.getFullYear() == endDate.getFullYear()) {
            //это текущий день, еще не просрочена
            return false;
        }
        if (nowDate > endDate) {
            //просрочка
            return true;
        } else {
            return false;
        }
    }

    //Преобразует русскоязычное сокращение названия месяца в англоязычное
    function rusToEngMonth(rusMonth) {
        months = {
            'янв': 'jan',
            'фев': 'feb',
            'мар': 'mar',
            'апр': 'apr',
            'май': 'may',
            'июн': 'jun',
            'июл': 'jul',
            'авг': 'aug',
            'сен': 'sep',
            'окт': 'oct',
            'ноя': 'nov',
            'дек': 'dec'
        }

        return months[rusMonth];
    }

    //вывод единиц измерения

    function getAmountUnit(valOfMeters) {

        switch (parseInt(valOfMeters)) {
            case 1:
                amount_unit = "м <sup>2</sup>";//м&sup2;
                break;
            case 2:
                amount_unit = "м <sup>3</sup>";//м&sup3;
                break;
            case 3:
                amount_unit = "м\\пог";
                break;
            case 4:
                amount_unit = "шт";
                break;
            case 5:
                amount_unit = "компл";
                break;
            default:
                amount_unit = "м";
                break;
        }
        return amount_unit;
    }

    //закрытие главной модалки c div
    $(document).on("click", "#overlay, .modal-edit__close-modal", function () {
        modalClose();
        chatConnectionClose();
    });

    //time-modal-close закрытие
    $('.close-time-modal').click(function () {
        $('.time-modal, .time-modal-wide,  #overlay-sort, .time-modal-tiny').hide();
    });

    //перебор месяцев
    function getMonthFromNumber(monthNumber) {
        var monthsArr = [
            'янв',
            'фев',
            'мар',
            'апр',
            'май',
            'июн',
            'июл',
            'авг',
            'сен',
            'окт',
            'ноя',
            'дек'
        ];
        return monthsArr[monthNumber - 1];
    }

    //рассчет разниц дат
    function getEndDate(startDate, durability) {
        var start_date = new Date(startDate);
        var end_date = new Date();
        end_date.setTime(start_date.getTime() + (durability * 24 * 60 * 60 * 1000));
        end_date = end_date.getDate() + " " + getMonthFromNumber(end_date.getMonth() + 1);
        return end_date;
    }

    //рассчет разниц дат
    function getDaysFromNowToDate(myDate) {
        var date1 = new Date();
        var date2 = new Date(myDate); //текущая дата
        var daysLag = Math.ceil(Math.abs((date2.getTime() - date1.getTime())) / (1000 * 3600 * 24));
        return daysLag - 1;
    }

    // //рассчет стоимости
    //     function calculatePrice(projectId, workId) {
    //         return $.ajax({
    //             type: "POST",
    //             url: "/calculate-price/" + projectId + '/' + workId,
    //         });
    //     }

    //ф-ия расчёта стоимостиы
    function livePriceCalculation(amount, price, sale) {
        var fullPrice = numberFormatWithoutSpaces(amount) * numberFormatWithoutSpaces(price);
        var fullSale = fullPrice / 100 * sale;
        var calculated = fullPrice - fullSale;
        var ceiled = Math.ceil(calculated / 100) * 100;
        summ = ceiled - calculated;
        if (parseFloat(summ) >= 50) {
            ceiled = ceiled - 100;
        }
        if (ceiled <= 0) {
            ceiled = '0';
        }
        return numberFormatWithSpaces(ceiled);
    }

    function recalc(type=false) {

        //Кроме того, что эта функция должна пересчитывать сумму в стадиях "На приёмке" и "На оплате",
        //должны срабватывать визуальные алерты о достижении лимитов
        /*Вызывать по:
                * 1) событию stop
                * 2) удалению карточки
                * 3) отмене действия (ф-ия cancel())
                * 4) изменению данных в истории (всё равно срабатывает пересчёт цены карточки, поэтому в calculatedPriceSuccess.done(function(){...});
                * 5) создании карточки
                * 6) запрету в fromStateToState (лучше в месте вызова ф-ии, если она возвращает false)
                * 7) подтверждении времени
                * Лучше бы придумать, как получить событие любого добавления/удаления карточки из стадии
                * (возможно MutationObserver). Но на изменения цены всё равно нужно вешать отдельно
                * */
        preacceptedSum = 0;
        price = 0;
        $('[data-href="5"]').find('.kan-card').each(function (i, item) {
            price = numberFormatWithoutSpaces($(item).find('.kanban-card__cost-val').html());
            if (isNaN(price)) {
                price = 0;
            }
            preacceptedSum += price;

        });

        onPaymentSum = 0;
        onPaymentDebtSum = 0;
        price = 0;
        $('.portlet-header').removeClass('card-red-border');

        //После смены лимита в стадии "На оплате" к карточке не добавляется класс, окрашивающий бордер в крассный при превышении лимита - нужно добавить вручную.
        //В других случаях класс должен назначаться на беке при получении даты с сервера
        if (type == 'on_payment') {
            $('[data-href="2"]').find('.kan-card').each(function (i, item) {
                var startStateDay = $(item).find('.kanban-card__limit-total-val').html();
                if (limits.on_payment_limit_expire.value > 0) {
                    if (startStateDay > limits.on_payment_limit_expire.value) {
                        if (!startStateDay.indexOf('-') + 1) {
                            $(item).find('.kanban-card__limit-total-val').addClass('kanban-card__limit-total-val-red');
                        }
                    } else {
                        $(item).find('.kanban-card__limit-total-val').removeClass('kanban-card__limit-total-val-red');
                    }
                }
            });
        }

        $('[data-href="2"]').find('.kan-card').each(function (i, item) {
            var itemPrice = numberFormatWithoutSpaces($(item).find('.kanban-card__cost-val').html());
            if (isNaN(itemPrice)) {
                itemPrice = 0;
            }
            price = itemPrice;

            var startStateDay = $(item).find('.kanban-card__limit-total-val').html();

            if (limits.on_payment_limit_expire.value > 0) {
                if (startStateDay > limits.on_payment_limit_expire.value) {
                    if ($(item).find('.kanban-card__limit-total-val').hasClass('kanban-card__limit-total-val-red')) {
                        onPaymentDebtSum += itemPrice;
                        $(item).find('.portlet-header').addClass('card-red-border');
                    }
                }
            }
            onPaymentSum += price;

        });

        if (preacceptedSum > limits.preaccepted_limit_sum.value && limits.preaccepted_limit_sum.value > 0) {
            $('#napriemke-block').find('.preaccepted-limit-sum').addClass('reached-limit-sum');
        } else {
            $('#napriemke-block').find('.preaccepted-limit-sum').removeClass('reached-limit-sum');
        }

        //Задолженность должна пересчитываться из карточек, отмеченных красным бордером
        if (onPaymentDebtSum > 0) {
            $('#import-block').find('.on-payment-debt').addClass('reached-limit-sum');
        } else {
            $('#import-block').find('.on-payment-debt').removeClass('reached-limit-sum');
            $('#import-block').find('.kanban-card__limit-total-val').removeClass('kanban-card__limit-total-val-red');
        }
        var worksCountBlocked = $('#inwork-block').find('.kanban-card__ban-icon:visible').length;
        var worksCountNotBlocked = $('#inwork-block').find('.kan-card').length - worksCountBlocked;

        $('#import-block').find('.on-payment-debt').html(numberFormatWithSpaces(onPaymentDebtSum));
        $('#napriemke-block').find('.preaccepted-limit-sum').html(numberFormatWithSpaces(preacceptedSum));
        $('#import-block').find('.on-payment-limit-sum').html(numberFormatWithSpaces(onPaymentSum));
        $('#inwork-block').find('#ban-count').html(worksCountBlocked);
        $('#inwork-block').find('.in-work-limit-count').html(worksCountNotBlocked);
    }

    //убирает пробелы из чисел
    function numberFormatWithoutSpaces(priceStr) {
        return parseFloat(priceStr.replace(",", ".").replace(/[^0-9.]/gim, ""));
    }

    //добавляет пробелы в числа
    function numberFormatWithSpaces(price) {
        return String(price).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
    }

    //читска правого датепикера в модалке времени при переносе карточек
    $('#datepicker-wide-input').click(function () {
        $('#datepicker-wide-input, #time-modal-wide__input').val('');
    });

    //смена даты при изменении в левом поле и передача в правое в datepicker в модалке времени
    $('#time-modal-wide__input').on('input', function () {
        valueOfDate = $(this).val();
        var b = Number(valueOfDate);
        var today = new Date(),
            inWeek = new Date();
        inWeek.setDate(today.getDate() + b);
        inWeek = getEndDate(today, valueOfDate - 1);
        $('#datepicker-wide-input').val(inWeek);
    });

    //смена даты стрелкой вверх при переносе карточке в модалке времени (маленькая)
    $('#mini-time-modal-up').click(function () {
        datesumm = $('.time-modal__input').val();
        var daysMiniModalVal = $('.time-modal__input').val();
        $('.time-modal__input').removeAttr("disabled").prop('required', true);
        ;
        if (datesumm != '') {
            datesumm = $('.time-modal__input').val();
        }
        datesumm++;
        $('.checkbox-label__checxbox-input-one').prop('checked', false);
        $('.time-modal__input').css('background-color', 'white').val(datesumm).trigger('input');

    });

    //смена даты стрелкой вверх при переносе карточке в модалке времени (болшьшая)
    $('#time-modal-wide-up').click(function () {
        datesumm = $('#time-modal-wide__input').val();
        var daysMiniModalVal = $('#time-modal-wide__input').val();
        $('#datepicker-wide-input').css('color', '#333');
        $('.time-modal-wide__input, #datepicker-wide-input').removeAttr("disabled").prop('required', true);
        if (daysMiniModalVal != '') {
            daysMiniModalVal = $('#time-modal-wide__input').val();
            daysMiniModalVal++;
            var daysMiniModalNew = daysMiniModalVal;
            $('#time-modal-wide__input').val(daysMiniModalNew).trigger('input');
        }
        else {
            $('#time-modal-wide__input').val('1').trigger('input');
        }
        $('.checkbox-label__checxbox-input-one').prop('checked', false);
        $('#time-modal-wide__input, #datepicker-wide-input').css('background-color', 'white');
    });

    //смена даты стрелкой вниз при переносе карточке в модалке времени (большая)
    $('#time-modal-wide-down').click(function () {
        var tempDate = $('#time-modal-wide__input').val();
        if (tempDate != '' && tempDate >= 1) {
            tempDate--;
            $('#time-modal-wide__input').val(tempDate);
            $('.checkbox-label__checxbox-input-one').prop('checked', false);
            $('#time-modal-wide__input, .time-modal__input').css('background-color', 'white');
            $('#datepicker-wide-input').css('background-color', 'white');
        }
        if (tempDate < 1) {
            tempDate--;
            $('#time-modal-wide__input').css('background-color', '#f5f5f5').val('');
            $('#datepicker-wide-input').css({'color': 'transparent', 'background-color': '#f5f5f5'}).val('');
            $('.checkbox-label__checxbox-input-one').prop('checked', true);
            $('.time-modal-wide__input, #datepicker-wide-input').removeAttr("required").attr('disabled', 'disabled');
        }
        $('#time-modal-wide__input').trigger('input');
    });

    //смена даты стрелкой вниз при переносе карточке в модалке времени (маленькая)
    $('#mini-time-modal-down').click(function () {
        var tempDate = $('.time-modal__input').val();
        if (tempDate != '' && tempDate >= 1) {
            tempDate--;
            $('.checkbox-label__checxbox-input-one').prop('checked', false);
            $('.time-modal__input').css('background-color', 'white').val(tempDate);
            ;
        }
        if (tempDate < 1) {
            tempDate--;
            $('.checkbox-label__checxbox-input-one').prop('checked', true);
            $('.time-modal__input').css('background-color', '#f5f5f5').val('').attr('disabled', 'disabled').removeAttr("required");
        }
        $('.time-modal__input').trigger('input');
    });

    //Чистка поля чекбоксом
    $('#label-time-checkbox, #label-time-checkbox-wide').on('change', function () {
        if ($(this).prop('checked')) {
            $('.time-modal__input, .time-modal-wide__input, #datepicker-wide-input').css('background-color', '#f5f5f5').val('').attr('disabled', 'disabled').removeAttr("required");
            datesumm = 0;
        }
        else {
            $('.time-modal__input, .time-modal-wide__input, #datepicker-wide-input').css('background-color', 'transparent').removeAttr("disabled").prop('required', true);
            datesumm = 0;
        }
    });

    $('#datepicker-wide-input').datepicker({dateFormat:'dd M', minDate: 0,
        // beforeShow: function() {
        //     // $(this).datepicker('option', 'maxDate', $('#to').val());
        // }
    });

    //datepicker в модалке переноса карточек
    $('#datepicker-wide-input').on("change input", function () {
        var myDate = $('#datepicker-wide-input').datepicker('getDate');
        var current = new Date();
        var difference = myDate - current;
        var weeks = difference / 1000 / 60 / 60 / 24;
        var c = parseInt(weeks);
        var example = Math.ceil(c);
        var date1 = new Date();
        var date2 = new Date(myDate);
        var daysLag = Math.ceil((date2.getTime() - date1.getTime()) / (1000 * 3600 * 24));

        if (daysLag >= 0) {
            $("#time-modal-wide__input").val(daysLag + 1);
            $('#datepicker-wide-input').css({'background-color': 'white', 'color': '#333'});
        }
        $('#label-time-checkbox-wide').trigger('input');
    });

    //права пользователя
    function getUsersWithRight(rightName, option) {
        return $.ajax({
            type: "POST",
            url: "/get-users-with-right/" + window.project_id,
            data: {
                "user_right_name": rightName,
                'option': option
            }
        });
    }

    //получение имени лимита
    function getStateLimitKeyByStateId(stateId) {
        var states = {
            '4': 'in_work_limit_count',
            '2': 'on_payment_limit_expire',
            '5': 'preaccepted_limit_sum'
        }
        return states[stateId];
    }

    //конструирование модалки-лимитов !!!
    function builderLimits(stateId, stageName, formName) {
        var limitsArr = [];

        limitUnits[stateId].forEach(function (item, i) {
            limitsArr += '<label class="limit-modal__label" for="' + item.id + '">\n' +
                '                <input class="limit-modal__input" type="radio" name="' + item.limit_name + '" value=" ' + item.id + ' " id="' + item.id + '">\n' +
                '                <span class="limit-modal__limit-btn">' + item.limit_text + '</span>\n' +
                '            </label>';
        });

        var limitkey = getStateLimitKeyByStateId(stateId);

        var transferLimits = '<form id="' + formName + '" class="limit-modal">\n' +
            '        <div class="limit-modal__main-title">\n' +
            '            Лимит стадии\n' +
            '        </div>\n' +
            '        <div class="limit-modal__stage-title">\n' +
            '            ' + stageName + ' \n' +
            '        </div>\n' +
            '        <div class="limit-modal__limit-block">' + limitsArr + '</div>\n' +
            '        <div class="limit-modal__chekbox-block">\n' +
            '            <label class="checkbox-label">\n' +
            '                <input name="' + limitkey + '" id="" class="checkbox-label__checxbox-input-one two-px-border limit-check" type="radio">\n' +
            '                <span class="checkbox-label__checxbox-span-three"></span>\n' +
            '            </label>\n' +
            '            <div class="limit-modal__without-limit">без лимита</div>\n' +
            '        </div>\n' +
            '        <div class="limit-modal__button-block">\n' +
            '            <button type="submit" class="limit-modal__agree-link">Сохранить</button>\n' +
            '            <div id="close" class="error-link">Отменить</div>\n' +
            '\n' +
            '        </div>\n' +
            '    </form>';
        return transferLimits;
    }

    //прикрепление сконструированной модалки лимитов !!!
    function showAlertModalLimits(stateId, stageName, formName, overlay) {
        var builderLimitsForm = builderLimits(stateId, stageName, formName);
        $(".limit-modal__block").html(builderLimitsForm);
        var height = document.documentElement.clientHeight;
        var modal = $(".limit-modal__block");
        var namemodal = modal.height() + 32;
        var totalheight = (height - namemodal) / 2;
        //оверлей и прелоадер
        $('#' + overlay + ', .preloader-block').show();
        modal.css('margin-top', totalheight).show();
    }

    //открытие лимитов на оплате
    $('.payments__settings').on('click', function (e) {
        if (userId == projectCreator.user_id && parseInt($('#time-remaning').text()) < 1) {
            showAlertModal('Срок действия сервиса подошёл к концу. Не беспокойтесь ваши данные не пропадут - они надёжно сохранены в Гибкой смете. Вы сможете приобрести подписку и продолжить использовать все инструменты для совместной работы.', PremiumOff, 'overlay-mini-vip');
        }

        else if (userId != projectCreator.user_id && parseInt($('#time-remaning').text()) < 1) {
            event.preventDefault();
            var alertText = "У данного пользоателя закончилась подписка. Вы можете связаться с ним по указанным ниже координатам: <br>" + getProjectCreatorPropsAva();
            showAlertModal(alertText, modalAlertCancelCreated, 'overlay-mini');
        }
        else {
            var rights = userRights.payments_accept_right;
            if (rights == 1) {
                e.preventDefault();
                showAlertModalLimits($(this).data("limit"), 'На оплате', 'onpay', 'overlay-mini');
                var limitsChecked = limits.on_payment_limit_expire.id;
                if (limitsChecked == 0) {
                    $('.limit-modal').find('.limit-check').prop('checked', true);
                }
                else {
                    $('.limit-modal').find('#' + limitsChecked + '').prop('checked', true);
                }
            }
            else if (rights == 0) {
                e.preventDefault();
                var alertText = "Менять значение может только: <br>" + allUsersRights.payments_accept_right;
                showAlertModal(alertText, modalAlertCancelCreated, 'overlay-mini');
            }
        }
    });

    //открытие лимитов на приемке
    $('.work-accept__settings').click(function (e) {

        if (userId == projectCreator.user_id && parseInt($('#time-remaning').text()) < 1) {
            showAlertModal('Срок действия сервиса подошёл к концу. Не беспокойтесь ваши данные не пропадут - они надёжно сохранены в Гибкой смете. Вы сможете приобрести подписку и продолжить использовать все инструменты для совместной работы.', PremiumOff, 'overlay-mini-vip');
        }

        else if (userId != projectCreator.user_id && parseInt($('#time-remaning').text()) < 1) {
            event.preventDefault();
            var alertText = "У данного пользоателя закончилась подписка. Вы можете связаться с ним по указанным ниже координатам: <br>" + getProjectCreatorPropsAva();
            showAlertModal(alertText, modalAlertCancelCreated, 'overlay-mini');
        }
        else {
            var rights = userRights.work_accept_right;
            if (rights == 1) {
                e.preventDefault();
                showAlertModalLimits($(this).data("limit"), 'На приёмке', 'preaccepted', 'overlay-mini');
                var limitsChecked = limits.preaccepted_limit_sum.id;
                if (limitsChecked == 0) {
                    $('.limit-modal').find('.limit-check').prop('checked', true);
                }
                else {
                    $('.limit-modal').find('#' + limitsChecked + '').prop('checked', true);
                }
            }
            else if (rights == 0) {
                e.preventDefault();
                var alertText = "Менять значение может только: <br>" + allUsersRights.work_accept_right;
                showAlertModal(alertText, modalAlertCancelCreated, 'overlay-mini');
            }
        }
    });

    //открытие лимитов в работе
    $('.in-work__settings').click(function (e) {

        if (userId == projectCreator.user_id && parseInt($('#time-remaning').text()) < 1) {
            showAlertModal('Срок действия сервиса подошёл к концу. Не беспокойтесь ваши данные не пропадут - они надёжно сохранены в Гибкой смете. Вы сможете приобрести подписку и продолжить использовать все инструменты для совместной работы.', PremiumOff, 'overlay-mini-vip');
        }

        else if (userId != projectCreator.user_id && parseInt($('#time-remaning').text()) < 1) {
            event.preventDefault();
            var alertText = "У данного пользоателя закончилась подписка. Вы можете связаться с ним по указанным ниже координатам: <br>" + getProjectCreatorPropsAva();
            showAlertModal(alertText, modalAlertCancelCreated, 'overlay-mini');
        }

        else {
            var rights = userRights.work_create_change_right;
            if (rights == 1) {
                e.preventDefault();
                showAlertModalLimits($(this).data("limit"), 'В работе', 'inwork', 'overlay-mini');
                var limitsChecked = limits.in_work_limit_count.id;
                if (limitsChecked == 0) {
                    $('.limit-modal').find('.limit-check').prop('checked', true);
                }
                else {
                    $('.limit-modal').find('#' + limitsChecked + '').prop('checked', true);
                }
            }
            else if (rights == 0) {
                e.preventDefault();
                var alertText = "Менять значение может только: <br>" + allUsersRights.work_create_change_right;
                showAlertModal(alertText, modalAlertCancelCreated, 'overlay-mini');
            }
        }
    });

    $('body').on('submit', '.limit-modal', function (event) {
        event.preventDefault();
        var form_data = $('.limit-modal').serialize();

        $.ajax({
            data: form_data,
            type: "POST",
            url: "/change-project-limit/" + window.project_id,
            success: function (data) {
                $('.limit-modal__block, #overlay-mini').hide();
                if (data.hasOwnProperty('new_limits')) {
                    limits = data.new_limits;
                }
                recalc('on_payment');

                $('.on_payment_limit_expire').text(limits.on_payment_limit_expire.text);

                $('.preaccepted_limit_sum').text(limits.preaccepted_limit_sum.text);

                $('.in_work_limit_count').text(limits.in_work_limit_count.text);

            },
            error: function (data) {
                $('.limit-modal__block, #overlay-mini').hide();
            }
        })
    });

    //прикрепление сконструированной модалки
    function showAlertModal(modalText, buttonsArray, overlay) {
        var buildedModal = builder(modalText, buttonsArray);
        $(".time-modal-tiny").html(buildedModal);
        var height = document.documentElement.clientHeight;
        var modal = $(".time-modal-tiny");
        var namemodal = modal.height() + 120;
        var totalheight = (height - namemodal) / 2;
        //оверлей и прелоадер
        $('#' + overlay + ', .preloader-block').show();
        modal.css('margin-top', totalheight).show();
    }

    //конструирование модалки-алерта
    function builder(modalText, buttonsArray) {
        var buttons = "";
        buttonsArray.forEach(function (item) {
            buttons += '<div id = "' + item.id + '" class="' + item.colorClass + '">' + item.name + '</div>';
        });
        // avatar = '<i class="fas fa-user-circle user-modal-'+ avatar + '"></i>';
        modalText = '<div class="time-modal-tiny__title-block"> ' + modalText + '</div>';
        buttonsRow = '<div class="time-modal-tiny__button-block">' + buttons + '</div>';
        return modal = modalText + " " + buttonsRow;
    }

    //Закрытие модалки без изменения
    function hideTiny() {
        $('.time-modal-tiny, #overlay-mini, #overlay-sort, .limit-modal__block, #overlay-recalc').hide();
        recalc();
    }

    //Вызов модалки на удаление карточек в канбане
    $("#del-btn").on("click", function () {

        if (userId == projectCreator.user_id && parseInt($('#time-remaning').text()) < 1) {
            showAlertModal('Срок действия сервиса подошёл к концу. Не беспокойтесь ваши данные не пропадут - они надёжно сохранены в Гибкой смете. Вы сможете приобрести подписку и продолжить использовать все инструменты для совместной работы.', PremiumOff, 'overlay-mini-vip');
        }

        else if (userId != projectCreator.user_id && parseInt($('#time-remaning').text()) < 1) {
            event.preventDefault();
            var alertText = "У данного пользоателя закончилась подписка. Вы можете связаться с ним по указанным ниже координатам: <br>" + getProjectCreatorPropsAva();
            showAlertModal(alertText, modalAlertCancelCreated, 'overlay-mini');
        }
        else {
            if (userRights.work_create_change_right == 0) {
                showAlertModal('Создавать новые работы, вносить в них изменения и удалять может только: <br>' + allUsersRights.work_create_change_right + ' ', modalAlertDeactivated, 'overlay-mini');
            }
            else {
                showAlertModal('Внимание! Вы пытаетесь удалить ' + countChecked() + ' ' + cardsEnding(countChecked()) + '.', modalDeleteCards, 'overlay-mini');
            }
        }
    });

    //Отмена удаления карточек
    $('body').on('click', '#close', function () {
        hideTiny();
        $('#overlay-mini-vip').hide();
    });

    //Редирект на страницу пользователей
    $('body').on('click', '#close-link', function () {
        window.location.href = "/user-table/" + window.project_id;
    });

    // Вывод только цифр
    $('body').on('keypress', '#sale-area, #saleHistory', function (event) {

        function validate(event) {
            var theEvent = event || window.event;
            var key = theEvent.keyCode || theEvent.which;
            key = String.fromCharCode(key);
            var regex = /[0-9]|\./;

            if (!regex.test(key)) {

                theEvent.returnValue = false;
                if (theEvent.preventDefault) theEvent.preventDefault();
            }
        }
    });

    //ограничения на ввод в поле "скидка"
    function validateSale(event, saleValue) {

        var theEvent = event || window.event;
        var key = theEvent.keyCode || theEvent.which;
        key = String.fromCharCode(key);
        var regex = /[0-9]|\./;
        saleValue += key;

        if (!regex.test(key) || saleValue < 0 || saleValue > 100) {

            theEvent.returnValue = false;
            if (theEvent.preventDefault) theEvent.preventDefault();
            return false;
        } else {

            return true;
        }
    }

    //вставка в скидку
    $('body').on('keypress paste', '#sale-area, #saleHistory', function (event) {
        // $('#sale-area').on('keypress paste', function(event) {

        if (!validateSale(event, $(this).val())) {

            $(".sale-alert").show();
        }
        else {

            $('.sale-alert').hide();
        }
    });

    //--------------------------Конструктор моалок--------------------------------
    var modalDeleteCards = [
        {'name': 'Подтвердить', 'colorClass': 'footer__link red-del', 'id': 'agree-ajax'},
        {'name': 'Отменить', 'colorClass': 'footer__link white-del', 'id': 'close'}
    ];

    var PremiumOff = [
        {'name': 'Оплатить', 'colorClass': 'footer__link', 'id': 'agree-pay'},
        {'name': 'Отменить', 'colorClass': 'footer__link white-del', 'id': 'close'}
    ];

    var modalDeleteAlerts = [
        {'name': 'Сбросить', 'colorClass': 'footer__link red-del', 'id': 'agree-clear-alert'},
        {'name': 'Отменить', 'colorClass': 'footer__link white-del', 'id': 'close'}
    ];

    var modalAlertDeactivated = [
        {'name': 'ОК', 'colorClass': 'footer__link', 'id': 'close'}
    ];

    var modalAlertChangeRightsCancelled = [
        {'name': 'Понятно', 'colorClass': 'footer__link', 'id': 'close'}
    ];

    var modalAlertRightsChange = [
        {'name': 'Понятно', 'colorClass': 'footer__link', 'id': 'close'},
        // {'name': 'Люди', 'colorClass': 'footer__link white-del', 'id':'close-link'}
    ];

    var modalAlertCancelCreated = [
        {'name': 'Понятно', 'colorClass': 'footer__link', 'id': 'close'},
        // {'name': 'Люди', 'colorClass': 'footer__link white-del', 'id':'close-link'}
    ];
    //--------------------------Конец Конструктора моалок-------------------------

    //КАРТОЧКИ КАНБАНА

    //Ф-ия добавляет красную рамку и делает дату завершения красной, и наоборот
    function makeInWorkCardExpiredDesign(cardId, isExpired=true) {
        var card = $('#card-' + cardId);
        if (isExpired) {
            card.find('.kanban-card').addClass('card-red-border-in-work');
            card.find('.kanban-card__limit-date-end').addClass('end-date-lighted');
            card.find('.kanban-card__limit-month-end').addClass('end-date-lighted');
        } else {
            card.find('.kanban-card').removeClass('card-red-border-in-work');
            card.find('.kanban-card__limit-date-end').removeClass('end-date-lighted');
            card.find('.kanban-card__limit-month-end').removeClass('end-date-lighted');
        }
    }

    //Динамическое создание карточки работы для добавления или замены аяксом
    function getWorkCardHtml(work_num, name, amount, amount_unit, price, sale, calculatedPrice, durability, subscription, isHiddenWork) {
        if (!durability) {
            durability = ' - ';
        }
        if (!sale) {
            sale = '';
            minus = '';
            persent = '';
        }
        else {
            minus = '-';
            persent = '%';
        }

        price = numberFormatWithSpaces(price);
        amount = numberFormatWithSpaces(amount);
        calculatedPrice = numberFormatWithSpaces(calculatedPrice);
        if (subscription == '0') {
            showHideStar = 'style="display:none"';
        } else {
            showHideStar = '';
        }
        if (isHiddenWork == '0') {
            showHideEye = 'style="display:none"';
        } else {
            showHideEye = '';
        }
        if ($('.fas.fa-toggle-on.breadcrumbs__detail-img').css('display') == 'none') {
            tempStyle = 'none';
        }
        else {
            tempStyle = 'flex';
        }

        var transfer = '<div class="kan-card portlet" id="card-' + work_num + '" data-work-id="' + work_num + '">\n' +
            '                                         <div class="kanban-card ui-sortable-handle portlet-header">\n' +
            '                                            <div class="kanban-card__inside-block">\n' +
            '                                                <div class="kanban-card__inside-block">\n' +
            '                                                    <div class="kanban-card__desc-block">\n' +
            '                                                        <div class="kanban-card__first-row">\n' +
            '                                                            <div class="kanban-card__check-block">\n' +
            '                                                                <label class="checkbox-label">\n' +
            '                                                                    <input class="checkbox-label__checxbox-input temp-check" type="checkbox" style="box-shadow: none;">\n' +
            '                                                                    <span class="checkbox-label__checxbox-span grey-spn"></span>\n' +
            '                                                                </label>\n' +
            '                                                            </div>\n' +
            '                                                            <div class="kanban-card__title-block">\n' +
            '                                                                <div class="kanban-card__title">\n' +
            '                                                                            <span class="kanban-card__id">\n' +
            '                                                                                <span class="card-id">' + work_num + '</span>\n' +
            '                                                                            </span>\n' +
            '                                                                    <span class="kanban-card__title-desc">' + name + '</span>\n' +
            '                                                                </div>\n' +
            '                                                            </div>\n' +
            '                                                        </div>\n' +
            '                                                        <div class="kanban-card__third-row">\n' +
            '                                                            <div class="kanban-card__left-group">\n' +
            '                                                                <div class="kanban-card__amount-block">\n' +
            '                                                                    <div class="kanban-card__amount-title-block">\n' +
            '                                                                        <div class="kanban-card__amount-title">Кол-во</div>\n' +
            '                                                                    </div>\n' +
            '                                                                    <div class="kanban-card__amount-val-block">\n' +
            '                                                                        <div class="kanban-card__amount-val">' + amount + '</div>\n' +
            '                                                                        <div class="kanban-card__amount-ei">' + amount_unit + '</div>\n' +
            '                                                                    </div>\n' +
            '                                                                </div>\n' +
            '                                                                <div class="kanban-card__price-block">\n' +
            '                                                                    <div class="kanban-card__price-title-block">\n' +
            '                                                                        <div class="kanban-card__price-title">Цена/ед.</div>\n' +
            '                                                                    </div>\n' +
            '                                                                    <div class="kanban-card__price-val-block">\n' +
            '                                                                        <div class="kanban-card__price-val">\n' + price + '</div>\n' +
            '                                                                        <div class="kanban-card__price-ei">' + minus + '\n' +
            '                                                                            <span class="card__persent">' + sale + '</span>' + persent + '\n' +
            '                                                                        </div>\n' +
            '                                                                    </div>\n' +
            '                                                                </div>\n' +
            '                                                                <div class="kanban-card__cost-block">\n' +
            '                                                                    <div class="kanban-card__cost-title-block">\n' +
            '                                                                        <div class="kanban-card__cost-title">Σ Стоимость</div>\n' +
            '                                                                    </div>\n' +
            '                                                                    <div class="kanban-card__cost-val-block">\n' +
            '                                                                        <div class="kanban-card__cost-val">' + calculatedPrice + '</div>\n' +
            '                                                                    </div>\n' +
            '                                                                </div>\n' +
            '                                                                <div class="kanban-card__limit-block">\n' +
            '                                                                    <div class="kanban-card__limit-title-block">\n' +
            '                                                                        <div class="kanban-card__limit-title">Срок</div></div>\n' +
            '                                                                    <div class="kanban-card__limit-values">\n' +
            '                                                                        <div class="kanban-card__limit-values"><div class="kanban-card__limit-total-val canceled-val">' + durability + '</div>\n' +
            '<div class="kanban-card__limit-right-bracket">дн.</div></div>\n' +
            '                                                                    </div>\n' +
            '                                                                </div>\n' +
            '                                                            </div>\n' +
            '                                                        </div>\n' +
            '                                                    </div>\n' +
            '                                                    <div class="kanban-card__icon-block">\n' +
            '                                                        <div class="kan-card-mini-block kanban-card__star-block">\n' +
            '                                                            <i class="fas fa-star star-kan" ' + showHideStar + '>\n' +
            '                                                            </i>\n' +
            '                                                           <span class="popup-left-icon" style="">Избранная работа</span>\n' +
            '                                                        </div>\n' +
            '                                                        <div class="kan-card-mini-block kanban-card__eye-block">\n' +
            '                                                            <i class="fas fa-eye-slash fiol-digit" ' + showHideEye + '></i>\n' +
            '                                                           <span class="popup-left-icon" style="">Скрытая работа</span>\n' +
            '                                                        </div>\n' +
            '                                                        <div class="kan-card-mini-block kanban-card__mail-block" style="display: none">\n' +
            '                                                           <i class="fas fa-envelope mail-icon"></i>\n' +
            '                                                            <span class="popup-left-icon" style="">Новое сообщение</span>\n' +
            '                                                        </div>\n' +
            '                                                        <div class="kan-card-mini-block kanban-card__i-block">\n' +
            '                                                            <i class="fas fa-info-circle i-icon" style="display:none"></i>\n' +
            '                                                            <span class="popup-left-icon" style="">Новое изменение</span>\n' +
            '                                                        </div>\n' +
            '                                                           <div class="kan-card-mini-block kanban-card__ban-icon">\n' +
            '                                                    </div>\n' +
            '                                                </div>\n' +
            '                                            </div>\n' +
            '                                            <div class="progress-bar--bar--line">\n' +
            '                                                <div style="width: 70%" class="progress-bar--bar--segment  green-kan"></div>\n' +
            '                                                <div class="progress-bar--bar--segment orange-kan"></div>\n' +
            '                                            </div>\n' +
            '                                            <div class="kanban-card__info-block-main">\n' +
            '                                                <div class="kanban-card__info-block">\n' +
            '                                                    <div class="kanban-card__left-info-block">\n' +
            '                                                        <div class="kanban-card__info-title">оплачено</div>\n' +
            '                                                        <div class="kanban-card__info-paid">98 999 999</div>\n' +
            '                                                    </div>\n' +
            '                                                    <div class="kanban-card__right-info-block">\n' +
            '                                                        <div class="kanban-card__info-title">остаток</div>\n' +
            '                                                        <div class="kanban-card__info-balance">98 999 999</div>\n' +
            '                                                    </div>\n' +
            '                                                </div>\n' +
            '                                            </div>\n' +
            '                                        </div>\n' +
            '                                    </div>';
        if ($('.fas.fa-toggle-off.breadcrumbs__img.off:visible')) {
            tempStyle = 'none';
        }
        else {
        }
        return transfer;
    }

    //открытие модалки на сброс оповещений
    $(".clear-icon").on("click", function () {
        showAlertModal('Сбросить все оповещения об изменениях ?', modalDeleteAlerts, 'overlay-mini');
    });

    //сброс оповещений
    $('body').on('click', '#agree-clear-alert', function () {
        $.ajax({
            type: "POST",
            url: "/unread-changes-clear/" + window.project_id,
            success: function (data) {
                $('.fas.fa-info-circle').hide();
                $('.time-modal-tiny, #overlay-mini').hide();
            }
        })
    });

    //подсчет карточек с активными иконками i
    var iIcon = $(".fas.fa-info-circle.i-icon:visible").length;
    if (iIcon > 0) {
        $('.clear-icon').show();
    } else {
        $('.clear-icon').hide();
    }

    // //подсчет карточек в работе
    //     var inWorkCount = $('#inwork-block').find('.kan-card.portlet').length;
    //     $('#in-work-count').text(inWorkCount);

    //сворачивание иконок канбана
    $('.short-title').click(function () {
        $(this).closest(".kanban__column").next(".kanban__short-column").show();
        $(this).closest(".kanban__column").hide();
        saveColumnsSates();
    });
    $('.kanban__short-column').click(function () {
        $(this).prev(".kanban__column").show();
        $(this).hide();
        saveColumnsSates();
    });

    //появление инфографики в канбане
    // $(".progress-bar--bar--line").mouseover(function(){
    //     $(this).next(".kanban-card__info-block-main").show();
    // });
    // $(".progress-bar--bar--line").mouseout(function(){
    //     $(this).next(".kanban-card__info-block-main").hide();
    // });
    // $(".kanban-card__price-block, .kanban-card__cost-block").mouseover(function(){
    //     $(this).closest(".kanban-card").find('.kanban-card__info-block-main').show();
    // });
    // $(".kanban-card__price-block, .kanban-card__cost-block").mouseout(function(){
    //     $(this).closest(".kanban-card").find('.kanban-card__info-block-main').hide();
    // });

    //смена стадий
    function changeWorkState(projectId, workId, newState) {

        $('#overlay-recalc').show();

        $.ajax({
            type: "POST",
            url: "/edit-work/" + projectId + "/" + workId,
            data: {
                "status": newState
            },
            success: function (data) {
                $('[data-work-id="' + workId + '"]').find('.kanban-card__limit-values').html(data); //В data передаётся html с отформатированным для каждой колонки временем
                $('[data-work-id="' + workId + '"]').find('.portlet-header').removeClass('card-red-border-in-work');
                recalc();
                $('#overlay-recalc').hide();
            }
        });

        saveColumnsSates();
    }

    //Подсчет чекнутых карточек в канбане
    function countChecked() {
        var checkboxChecked = $(".temp-check:checked").length;
        return checkboxChecked;
    };

    //
    function fromStateToState(fromStateId, toStateId) {

        if (fromStateId == toStateId) {
            return true;
        } // если перетаскивание производится

        //Реакция на лимиты
        var preacceptedSum = numberFormatWithoutSpaces($('#napriemke-block').find('.preaccepted-limit-sum').html());

        if (toStateId == 5 && preacceptedSum > limits.preaccepted_limit_sum.value && limits.preaccepted_limit_sum.value > 0) {
            showAlertModal('Превышен лимит стадии "На приёмке"', modalAlertDeactivated, 'overlay-mini');
            sendPreacceptedLimitSumNotification();
        }

        if (fromStateId == '1' && (toStateId == '2')) {
            showAlertModal('Перемещение карточки противоречит естественному потоку процесса. Перед направлением работы на приёмку, карточка должна пройти стадии на "Приёмке"', modalAlertDeactivated, 'overlay-mini');
            return false;
        }       // из Запланированные работа может попасть только в В работе и в Отменённые.
        else if ((fromStateId == '1') && (toStateId != 3 && toStateId != 4)) {
            showAlertModal('Перемещение карточки противоречит естественному потоку процесса. Перед направлением работы на приёмку, карточка должна пройти стадию В работе', modalAlertDeactivated, 'overlay-mini');
            return false;
        }  // из Принятые только в Запланированные или в Работе; из Отменённые только в Запланированные или В Работе.

        else if (fromStateId == '6' && (toStateId == '2')) {
            showAlertModal('Перемещение карточки противоречит естественному потоку процесса. Перед направлением работы на приёмку, карточка должна пройти стадии на "Приёмке"', modalAlertDeactivated, 'overlay-mini');
            return false;
        }       // из Запланированные работа может попасть только в В работе и в Отменённые.
        else if ((fromStateId == '6') && (toStateId != 5 && toStateId != 3 && toStateId != 4)) {
            return false;
        }  // из Принятые только в Запланированные или в Работе; из Отменённые только в Запланированные или В Работе.

        else if (fromStateId == '4' && (toStateId == '2')) {
            showAlertModal('Перемещение карточки противоречит естественному потоку процесса. Перед направлением работы на приёмку, карточка должна пройти стадии на "Приёмке"', modalAlertDeactivated, 'overlay-mini');
            return false;
        }       // из Запланированные работа может попасть только в В работе и в Отменённые.
        else if (fromStateId == '4' && (toStateId == '6')) {
            showAlertModal('Перемещение карточки противоречит естественному потоку процесса. Перед направлением работы на приёмку, карточка должна пройти стадии на "Приёмке" и "На оплате"', modalAlertDeactivated, 'overlay-mini');
            return false;
        }       // из Запланированные работа может попасть только в В работе и в Отменённые.
        else if (fromStateId == '4' && (toStateId != '3' && toStateId != '5')) {
            return false;
        }  // из В работе только в На приёмке или в Запланированные

        else if (fromStateId == '3' && (toStateId == '2')) {
            showAlertModal('Перемещение карточки противоречит естественному потоку процесса. Перед направлением работы на приёмку, карточка должна пройти стадии на "Приёмке"', modalAlertDeactivated, 'overlay-mini');
            return false;
        }       // из Запланированные работа может попасть только в В работе и в Отменённые.
        else if (fromStateId == '3' && (toStateId != '1' && toStateId != '4')) {
            showAlertModal('Перемещение карточки противоречит естественному потоку процесса. Перед направлением работы на приёмку, карточка должна пройти стадию В работе', modalAlertDeactivated, 'overlay-mini');
            return false;
        }       // из Запланированные работа может попасть только в В работе и в Отменённые.
        //право "Производит приёмку работ"
        else if (fromStateId == '5' && toStateId == '2' && !userRights.work_accept_right) {
            showAlertModal('Принимает работы только: ' + allUsersRights.work_accept_right, modalAlertDeactivated, 'overlay-mini');
            return false;
        }       // Из "На приёмке" в "На оплате" работа может попасть только если есть право "Производит приёмку работ"
        //право "Подтверждает оплаты"
        else if ((fromStateId == '2' || fromStateId == '5') && toStateId == '6' && !userRights.payments_accept_right) {
            showAlertModal('Подтверждает оплату только: ' + allUsersRights.payments_accept_right, modalAlertDeactivated, 'overlay-mini');
            return false;
        } // Из "На приёмке" или "На оплате" в "Завершенное" работа может попасть только если есть право "Подтверждает оплаты"

        else if (fromStateId == '5' && (toStateId != '2' && toStateId != '3' && toStateId != '4' && toStateId != '6')) {
            return false;
        }  // из На приёмке только в В работе или Принятые
        else {
            return true;
        }
    }

    //Отправлять письмо при превышении лимита по сумме в стадии "На приёмке"
    function sendPreacceptedLimitSumNotification() {
        $.ajax({
            type: "POST",
            url: "/preaccepted-sum-exceeded-send-alert/" + window.project_id,
            data: {
                "preaccepted-sum-now": numberFormatWithoutSpaces($('.preaccepted-limit-sum').html())
            }
        });
    }

    //Сохраняет открытое/закрытое состояние колонок для проекта. Вызывается при скрытии/показе колонок и смене состояния
    function saveColumnsSates() {
        var columnStatesArr = {
            "canceled": 0,
            "imported": 0,
            "planned": 0,
            "in_work": 0,
            "preaccepted": 0,
            "accepted": 0
        };

        var states = $('.kanban__column:visible');

        $.each(states, function (i, item) {
            switch (item.id) {
                case ("cancel-block"):
                    columnStatesArr['canceled'] = 1;
                    break;
                case ("import-block"):
                    columnStatesArr['imported'] = 1;
                    break;
                case ("planned-block"):
                    columnStatesArr['planned'] = 1;
                    break;
                case ("inwork-block"):
                    columnStatesArr['in_work'] = 1;
                    break;
                case ("napriemke-block"):
                    columnStatesArr['preaccepted'] = 1;
                    break;
                case ("confirm-block"):
                    columnStatesArr['accepted'] = 1;
                    break;
            }
        });

        $.ajax({
            type: "POST",
            url: "/save-columns-states/" + window.project_id,
            data: {
                "columns_states": columnStatesArr
            }
        });
    }

    //функция склонения карточек при удалении
    function cardsEnding(cardsParametr) {
        titles = ['карточку', 'карточки', 'карточек'];
        cases = [2, 0, 1, 1, 1, 2];
        return titles[(cardsParametr % 100 > 4 && cardsParametr % 100 < 20) ? 2 : cases[(cardsParametr % 10 < 5) ? cardsParametr % 10 : 5]];
    }

    //удаление карточек Аяксом из модалки
    $('body').on('click', '#agree-ajax', function () {

        var massiveOfCheckedCards = [];
        $('.time-modal-tiny, .footer').hide();
        $(".temp-check:checked").each(function (i, item) {
            var kanCard = $(this).closest('.kanban-card').find('.card-id');
            var cardId = kanCard.text().trim();
            massiveOfCheckedCards.push(cardId);
        });

        $.ajax({
            data: {
                "works": massiveOfCheckedCards
            },
            type: "POST",
            url: "/delete-checked-works/" + window.project_id,
            success: function (data) {
                if (data.works != 0) {
                    $(".temp-check:checked").each(function () {
                        $(this).closest('.kan-card').remove();
                    });
                }
                $('.control-checked').prop('checked', false);

                $('#overlay-mini').hide();
                recalc();
            },
            error: function (data) {
                $('#overlay-mini').hide();
                recalc();
            }
        })

    });

    //оставить на время
    $(document).mouseup(function () {
        $('.kanban__column-kan-block').stop();
    });

    //ЧЕКБОКСЫ
    //снять все чекбоксы
    $(document).on('click', '#uncheck', function () {
        $('.control-checked, .temp-check').prop('checked', false);
        $('.footer').hide();
    });

    //изменения по выделению чекбокса на карточке
    $(document).on('change', '.temp-check', function () {
        minisumm = 0;
        miniday = 0;
        $(".kanban-card__cost-val").each(function () {
            if ($($(this).closest('.kanban-card').find('.temp-check')).prop('checked') == true) {
                price = numberFormatWithoutSpaces($(this).html());
                if (isNaN(price)) {
                    price = 0;
                }
                minisumm += price;
            }
        });

        $(".canceled-val").each(function () {
            if ($($(this).closest('.kanban-card').find('.temp-check')).prop('checked') == true) {
                price = numberFormatWithoutSpaces($(this).html());
                if (isNaN(price)) {
                    price = 0;
                }
                miniday += price;
            }
        });

        $(".limit-month-end").each(function () {
            if ($($(this).closest('.kanban-card').find('.temp-check')).prop('checked') == true) {
                var giperVal = $(this).text();
                switch (giperVal) {
                    case 'янв':
                        engMonth = 'jan';
                        break;
                    case 'фев':
                        engMonth = 'feb';
                        break;
                    case 'мар':
                        engMonth = 'mar';
                        break;
                    case 'апр':
                        engMonth = 'apr';
                        break;
                    case 'май':
                        engMonth = 'may';
                        break;
                    case 'июн':
                        engMonth = 'jun';
                        break;
                    case 'июл':
                        engMonth = 'jul';
                        break;
                    case 'авг':
                        engMonth = 'aug';
                        break;
                    case 'сен':
                        engMonth = 'sep';
                        break;
                    case 'окт':
                        engMonth = 'oct';
                        break;
                    case 'ноя':
                        engMonth = 'nov';
                        break;
                    case 'дек':
                        engMonth = 'dec';
                        break;
                    default:
                        engMonth = 'jan';
                }

                var nowLong = new Date();

                var prevDay = $(this).prev('.kanban-card__limit-date-end').text();

                var formattedDay = new Date(prevDay + engMonth + 2018); //'1 дек' нужно преобразовать в этот формат

                if (nowLong <= formattedDay) {
                    price = Math.ceil(Math.abs(formattedDay.getTime() - nowLong.getTime()) / (1000 * 3600 * 24));
                } else {
                    price = 0;
                }

                if (isNaN(price)) {
                    price = 0;
                }
                miniday += price;
            }
        });

        $("#footer-price").html(numberFormatWithSpaces(minisumm));
        $("#footer-day-val").html(numberFormatWithSpaces(miniday));

        temp = undefined;
        minisummval = 0;
        oldAmountUnit = [];
        i = 0; // новый код
        $(".kanban-card__amount-val").each(function () {
            if ($($(this).closest('.kanban-card').find('.temp-check')).prop('checked') == true) {
                priceval = numberFormatWithoutSpaces($(this).html());
                if (isNaN(priceval)) {
                    priceval = 0;
                }
                amountUnit = $(this).closest('.kanban-card').find('.kanban-card__amount-ei').html().trim();

                oldAmountUnit[i] = amountUnit;
                if (i > 0) {

                    if (oldAmountUnit[i - 1] != amountUnit) {
                        temp = $("#footerval").html('Разные единицы');

                    }
                }
                i++;
                minisummval += priceval;
                if (typeof(temp) == "undefined") {
                    $("#footerval").html(numberFormatWithSpaces(minisummval));
                    $("#footerei").html(amountUnit);
                }
                else {
                    $("#footerval").html('Разные единицы');
                    $("#footerei").html('');
                }
            }
        });

        //считаем чекнутые чекбоксы
        checked_checkbox_count = $(this).closest('.kanban__column').find('.temp-check:checked').length;

        //считаем дочерние чекбоксы
        checkbox_count = $(this).closest('.kanban__column').find('.temp-check').length;

        //отключаем главный чекбокс если не все дочерние выделены
        if (checked_checkbox_count != checkbox_count) {
            $(this).closest('.kanban__column').find('.control-checked').prop('checked', false);
        }

        //включаем главный чекбокс если все дочерние выделены
        if (checkbox_count == checked_checkbox_count) {
            $(this).closest('.kanban__column').find('.control-checked').prop('checked', true);
        }

        checkbox_count = $('.temp-check:checked').length;

        //если нет дочерних чекнутых чекбоксов - убираем футер
        if (checkbox_count == 0) {
            $('.footer').hide();
        }

        //если есть дочерние чекнутые чекбоксы - ставим футер
        else {
            $('.footer').css('display', 'flex');
        }
    });

    //изменения по выделению чекбокса в стадии
    $(document).on('change', '.control-checked', function () {
        checkbox_count_temp = $('.temp-check:checked').length;

        if (checkbox_count_temp == 0) {
            $('.footer').hide();
        }
        //если есть главный чекнутый чекбокса - ставим футер
        else {
            $('.footer').css('display', 'flex');
        }
    });

    $('.control-checked').change(function () {
        checkbox_count = $('.control-checked:checked').length;

        //выделяем дочерние чекбоксы по главному чекбоксу
        if ($(this).prop('checked') == true) {
            $(this).closest('.kanban__column').find('.temp-check').prop('checked', true);
        }

        //снимаем дочерние чекбоксы по главному чекбоксу
        else {
            $(this).closest('.kanban__column').find('.temp-check').prop('checked', false);
        }

        minisumm = 0;
        miniday = 0;

        $(".kanban-card__cost-val").each(function () {
            if ($($(this).closest('.portlet-header').find('.temp-check')).prop('checked') == true) {
                price = numberFormatWithoutSpaces($(this).html());
                if (isNaN(price)) {
                    price = 0;
                }
                minisumm += price;
            }
        });
        $(".canceled-val").each(function () {
            if ($($(this).closest('.portlet-header').find('.temp-check')).prop('checked') == true) {
                price = numberFormatWithoutSpaces($(this).html());
                if (isNaN(price)) {
                    price = 0;
                }
                miniday += price;
            }
        });

        $(".limit-month-end").each(function () {
            if ($($(this).closest('.kanban-card').find('.temp-check')).prop('checked') == true) {
                var giperVal = $(this).text();

                switch (giperVal) {
                    case 'янв':
                        engMonth = 'jan';
                        break;
                    case 'фев':
                        engMonth = 'feb';
                        break;
                    case 'мар':
                        engMonth = 'mar';
                        break;
                    case 'апр':
                        engMonth = 'apr';
                        break;
                    case 'май':
                        engMonth = 'may';
                        break;
                    case 'июн':
                        engMonth = 'jun';
                        break;
                    case 'июл':
                        engMonth = 'jul';
                        break;
                    case 'авг':
                        engMonth = 'aug';
                        break;
                    case 'сен':
                        engMonth = 'sep';
                        break;
                    case 'окт':
                        engMonth = 'oct';
                        break;
                    case 'ноя':
                        engMonth = 'nov';
                        break;
                    case 'дек':
                        engMonth = 'dec';
                        break;
                    default:
                        engMonth = 'jan';
                }
                var nowLong = new Date();
                var prevDay = $(this).prev('.kanban-card__limit-date-end').text();
                var formattedDay = new Date(prevDay + engMonth + 2018); //'1 дек' нужно преобразовать в этот формат
                if (nowLong <= formattedDay) {
                    price = Math.ceil(Math.abs(formattedDay.getTime() - nowLong.getTime()) / (1000 * 3600 * 24));
                } else {
                    price = 0;
                }
                if (isNaN(price)) {
                    price = 0;
                }
                miniday += price;
            }
        });

        $("#footer-price").html(numberFormatWithSpaces(minisumm));
        $("#footer-day-val").html(numberFormatWithSpaces(miniday));

        //считаем количество
        temp = undefined;
        minisummval = 0;
        oldAmountUnit = [];
        i = 0; // новый код
        $(".kanban-card__amount-val").each(function () {
            if ($($(this).closest('.kanban-card').find('.temp-check')).prop('checked') == true) {
                priceval = numberFormatWithoutSpaces($(this).html());
                if (isNaN(priceval)) {
                    priceval = 0;
                }
                amountUnit = $(this).closest('.kanban-card').find('.kanban-card__amount-ei').html().trim();


                oldAmountUnit[i] = amountUnit;
                if (i > 0) {

                    if (oldAmountUnit[i - 1] != amountUnit) {
                        temp = $("#footerval").html('Разные единицы');
                    }
                }
                i++;
                minisummval += priceval;
                if (typeof(temp) == "undefined") {
                    $("#footerval").html(numberFormatWithSpaces(minisummval));
                    $("#footerei").html(amountUnit);
                }
                else {
                    $("#footerval").html('Разные единицы');
                    $("#footerei").html('');
                }
            }
        });

        //если нет главного чекнутого чекбокса - убираем футер
        if (checkbox_count == 0) {
            $('.footer').hide();
        }
    });

    //запрет на перемещение карточки если курсор над чекбоксом
    $(".kanban-card__check-block").mouseover(function () {
        $('.kanban-card').removeClass("portlet-header");
    });
    $(".kanban-card__check-block").mouseout(function () {
        $('.kanban-card ').addClass("portlet-header");
    });

    /****************************************************************************
     Чат
     /***************************************************************************/
        //чат и подключение
    var conn = false;

    function chatConnection(projectId, workId) {
        //var JWT = getJWTFromLocalStorage();
        //var JWT = 'test.jwt.message';
        var JWT = localStorage.getItem('jwt_token');//Получив id из JWT, мы сможем сравнить его с //id пользователя, отправившего сообщение, и если они равны,  //выводить "Я" вместо фамилии.

        var explodedJWT = JWT.split('.');
        var jwtUserId = JSON.parse(atob(explodedJWT[1])).user_id;

        conn = new WebSocket('ws://' + location.hostname + ':' + envChatPort); //раскомментировать
        conn.onopen = function (event) {
            // console.log('Connected!');
            var data = {
                'type': 'chat_auth',
                'data': JWT,
                'room_id': projectId + '-' + workId
            };
            conn.send(JSON.stringify(data));
        };
        conn.onmessage = function (p1) {
            var userId = JSON.parse(event.data).user_id;
            // console.log(JSON.parse(event.data));
            if (userId == jwtUserId) {
                addMessageToChat('self', JSON.parse(event.data), 'append');
            } else {
                addMessageToChat('other', JSON.parse(event.data), 'append');
            }
            $('.chat__chat-block').scrollTop($('.chat__chat-block').prop('scrollHeight'));
        };
    }

    function chatConnectionClose() {
        conn.close();
    }

    function sendMessage(message, projectId, workId) {
        //var data = 'Данные для отправки: ' + message;
        var roomId = projectId + '-' + workId;
        var date = new Date();
        /*var tzDifference = +3.00;
                var date = new Date(targetTime.getTime() + tzDifference * 60 * 1000);*/
        var minutes = ('0' + date.getMinutes()).slice(-2);
        var time = date.getHours() + ':' + minutes;
        var data = {
            'type': 'chat_message',
            'message': message,
            'room_id': roomId,
            'day': date.getDate(),
            'month': getMonthFromNumber(date.getMonth() + 1),
            'year': date.getFullYear(),
            'time': time
        };
        conn.send(JSON.stringify(data));
        addMessageToChat('self', data, 'append');
        $('.chat__chat-block').scrollTop($('.chat__chat-block').prop('scrollHeight'));
    }

    $('.chat__chat-form').on('submit', function (e) {
        e.preventDefault();
        var workId = $('#modalEditId').html();
        var message = $('.chat__input').val();
        if (message) {
            sendMessage(message, window.project_id, workId);
            $('.chat__input').val('');
            var div = $('.chat__chat-block');
            div.scrollTop(div.prop('scrollHeight'));
        }
    });

    function getMessageHtml(type, data) {
        if (!data.role) {
            data.role = '';
        }
        switch (type) {
            case ('self'):
                return '<div class="chat__red-post">' +
                    '   <div class="chat__message-red">' +
                    '       <p class="chat__content">' + data.message + '</p>' +
                    '   </div>' +
                    '   <div class="chat__desc-block">' +
                    '      <div class="chat__author">Я</div>' +
                    '      <div class="chat__role"></div>' +
                    '           <time class="chat__date">' +
                    '               <div class="chat__day">' + data.day + '</div>' +
                    '               <div class="chat__month">' + data.month + '</div>' +
                    '               <div class="chat__time">' + data.year + '</div>' +
                    '               <time class="chat__hour">' + data.time + '</time>' +
                    '           </time>' +
                    '       </div>' +
                    '</div>';
                break;

            case ('other'):
                return '<div class="chat__blue-post">' +
                    '   <div class="chat__message-blue">' +
                    '       <p class="chat__content">' + data.message + '</p>' +
                    '   </div>' +
                    '   <div class="chat__desc-block-reverse">' +
                    '       <div class="chat__author">' + data.author + '</div>' +
                    '      <div class="chat__role">' + data.role + '</div>' +
                    '           <time class="chat__date">' +
                    '               <div class="chat__day">' + data.day + '</div>' +
                    '               <div class="chat__month">' + data.month + '</div>' +
                    '               <div class="chat__time">' + data.year + '</div>' +
                    '               <time class="chat__hour">' + data.time + '</time>' +
                    '           </time>' +
                    '       </div>' +
                    '   </div>';
                break;
        }
    }

    function addMessageToChat(type, data, appendOrPrepend) {
        day = 'testday';
        month = 'testmonth';
        time = 'testtime';
        if (!data.role) {
            data.role = '';
        }

        var selfBaloon = getMessageHtml('self', data);
        var otherBaloon = getMessageHtml('other', data);

        var chatBlock = $('.chat__chat-block');
        if (appendOrPrepend == 'append') {
            switch (type) {
                case ('self'):
                    chatBlock.append(selfBaloon);
                    break;
                case ('other'):
                    chatBlock.append(otherBaloon);
                    break;
            }
        }
        else {
            switch (type) {
                case ('self'):
                    chatBlock.prepend(selfBaloon);
                    break;
                case ('other'):
                    chatBlock.prepend(otherBaloon);
                    break;
            }
        }
    }

    function getChatMessages(projectId, workId, offset) {
        return $.ajax({
            type: "POST",
            url: "/get-chat-messages/" + projectId + '/' + workId,
            data: {
                "offset": offset,
            },
            success: function () {
                $('[data-work-id="' + workId + '"]').find(".kanban-card__mail-block").hide();
            }
        });
    }

    /****************************************************************************
     end Чат
     /***************************************************************************/

    $('.prevent-default').click(function (e) {
        e.preventDefault();
    });
});

$(document).ready(function () {
    //горизонтальная прокрутка в канбане
    var scr = $(".kanban__main-block");
    scr.mousedown(function (e) {

        if ($(e.target).attr('class').indexOf('kanban__main-block') + 1 ||
            $(e.target).attr('class').indexOf('ui-sortable') + 1
        ) {
            // console.log('нажатие1');
            var startX = this.scrollLeft + e.pageX;
            scr.mousemove(function (e) {
                // console.log('ведение2');
                this.scrollLeft = startX - e.pageX;
                return false;
            });
        }
    });
    $(window).mouseup(function () {
        // console.log('отпускание3');
        scr.off("mousemove");
    });

    $('#overlay-load-kanban').hide();

    // //<!-- Yandex.Metrika counter -->
    //     (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    //         m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
    //     (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    //
    //     ym(51963380, "init", {
    //         id:51963380,
    //         clickmap:true,
    //         trackLinks:true,
    //         accurateTrackBounce:true,
    //         webvisor:true
    //     });
});

$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});
