itemsArr = {};
tempFiltersArr = {};

$('body').on('click', '.database-items__list li', function () {
   var type = $(this).closest('.database-items__list').data('type');

   if (type == 'filter-types') {

       //Если такого типа данных ещё не существует, создаём
       if (typeof tempFiltersArr[type] === "undefined") {
           tempFiltersArr[type] = {'add': {}, 'delete': {}};
       }
       tempFiltersArr['filter-options'] = {'add': {}, 'delete': {}};
       //Только один тип можно выбрать предварительно
       tempFiltersArr[type].add = {};

       if ($(this).hasClass('active-item')) {
           $(this).removeClass('active-item');
           $('.database-items__list[data-type="filter-options"] > ul').html("");
           tempFiltersArr[type] = {'add': {}, 'delete': {}};
           return;
       }
       $('[data-type="filter-types"] > ul > li').removeClass('active-item');

       tempFiltersArr[type].add['filter_type'] = {'id': $(this).data('item-id'), 'name': $(this).html()};

       $(this).addClass('active-item');
       //Необходимо подгрузить все нужные опции для данного типа фильтра
       var offset = 0;
       $('[data-type="filter-options"]').scrollTop(0);
       $('[data-type="filter-options"]').attr('data-offset', offset);
       $.ajax({
           method: "POST",
           url: '/get-filter-options/' + tempFiltersArr[type]['add']['filter_type'].id,
           data: {
               'type': type,
               'offset': offset
           },
           success: function (data) {
               optionsList = "";
               data.items.forEach(function (item) {
                   optionsList = optionsList + '<li data-item-id="' + item.id + '">' + item.name + '</li>';
               });
               $('.database-items__list[data-type="filter-options"] ul').html(optionsList);
           }
       });

   } else if (type == 'filter-options') {
       //Если такого типа данных ещё не существует, создаём
       if (typeof tempFiltersArr[type] === "undefined") {
           tempFiltersArr[type] = {'add': {}, 'delete': {}}
       }

       tempFilterTypeId = tempFiltersArr['filter-types']['add']['filter_type']['id'];
       if (typeof filterTypesArr['add'][tempFilterTypeId] !== 'undefined') {
           if (filterTypesArr['add'][tempFilterTypeId].indexOf($(this).data('item-id')) != -1) {
               toastr.error("Данная опция уже есть в списке!");
               return;
           }
       }

       //Проверяем, добавлен ли item в массив add. Если нет, добавляем
       if (typeof tempFiltersArr[type].add[$(this).data('item-id')] === "undefined") {
           tempFiltersArr[type].add[$(this).data('item-id')] = $(this).html();
           //$(this).css('background', '#00a700').css('color', 'white');
           $(this).addClass('active-item');
           updateAdded(type);
       } else {
           //Иначе удаляем из массива
           delete tempFiltersArr[type].add[$(this).data('item-id')];
           //$(this).css('background', 'white').css('color', '#76838f');
           $(this).removeClass('active-item');
           updateAdded(type);
       }

   } else {
       //Если такого типа данных ещё не существует, создаём
       if (typeof itemsArr[type] === "undefined") {
           itemsArr[type] = {'add': {}, 'delete': {}}
       }

       //Проверяем, добавлен ли item в массив add. Если нет, добавляем
       if (typeof itemsArr[type].add[$(this).data('item-id')] === "undefined") {
           itemsArr[type].add[$(this).data('item-id')] = $(this).html();
           //$(this).css('background', '#00a700').css('color', 'white');
           $(this).addClass('active-item');
           updateAdded(type);
       } else {
           //Иначе удаляем из массива
           delete itemsArr[type].add[$(this).data('item-id')];
           //$(this).css('background', 'white').css('color', '#76838f');
           $(this).removeClass('active-item');
           updateAdded(type);
       }
   }

});

function updateAdded(type) {
    if (typeof itemsArr[type] !== "undefined") {
        itemList = "";
        for (var i in itemsArr[type].add) {
            itemList = itemList + '<li data-item-id="' + i + '">' + itemsArr[type].add[i] + '</li>';
        }

        $('.new-items-' + type).show();
        $('.new-items-' + type + '__list ul').html(itemList);
    }

    /*if(Object.keys(itemsArr[type].add).length == 0) {
        $('.new-items-' + type).hide();
    }*/
    $('.items-arr').val(JSON.stringify(itemsArr));
}

//Добавление в список на удаление
$('body').on('click', '.add-item-to-delete-items', function () {
    var type = $(this).closest('.old-items__list').data('type');
    var id = $(this).parent('li').attr('class').replace('item-', '');
    var name = $(this).parent('li').find('.item-name').html();
    addItemToDeleteItems(id, name, type);
});

function addItemToDeleteItems(optionId, optionName, type=false) {
    //Это уже добавленная в базу опция. Проверяем, существует ли она
    if (!type) {
        newtype = $('.custom-relation').data('type');
    } else {
        newtype = type;
        if (typeof itemsArr[type] === "undefined") {
            itemsArr[type] = {'add': {}, 'delete': {}}
        }
    }

    if (type) {
            // Добавляем в массив delete
            if (optionName !== '') {
                if (
                    typeof itemsArr[type].delete[optionId] !== "undefined"
                ) {
                    toastr.error("Вы уже добавили опцию с таким названием в список на удаление");
                } else {
                    itemsArr[type].delete[optionId] = optionName;
                    $('.delete-items-' + newtype + '__list ul').append("<li>" + optionName + "</li>");
                    $('.items-arr').val(JSON.stringify(itemsArr));
                    $('.delete-items-' + newtype).show();
                    markDeletedItem(optionId);
                }
            } else {
                toastr.error("Укажите название опции");
            }

    } else {

        $.ajax({
            type: "POST",
            url: "/check-option-existanse/" + pageId,
            data: {
                'option-id' : optionId,
                'type': newtype
            },
            success: function (data) {
                if (data.exists) {
                    // Добавляем в массив delete
                    if (optionName !== '') {
                        if (
                            typeFilterOptionsAddDelete['delete'].indexOf(optionId) != -1
                        ) {
                            toastr.error("Вы уже добавили опцию с таким названием в список на удаление");
                        } else {
                            //Добавляется
                            typeFilterOptionsAddDelete['delete'].push(optionId);
                            $('.delete-items__list ul').append("<li>" + optionName + "</li>");
                            $('.type-filter-options-add-delete').val(JSON.stringify(typeFilterOptionsAddDelete));
                            markDeletedItem(optionId);
                            showHideAddDeleteBlock();
                        }
                    } else {
                        toastr.error("Укажите название опции");
                    }
                } else {
                    toastr.error("Опция с таким id в данном типе фильтра не существует");
                }
            }
        });
    }


}

var filterTypesArr = {'add': {}, 'delete': {}};
var html = "";
//Добавление новых опций фильтра
function updateFilterTypeFilterOptionAddList() {
    if (Object.keys(tempFiltersArr).length == 0 || Object.keys(tempFiltersArr['filter-types']["add"]).length == 0) {
        toastr.error("Выберите хотя бы один тип фильтра из списка");
    } else if (Object.keys(tempFiltersArr['filter-options']["add"]).length == 0) {
        toastr.error("Выберите хотя бы одну опцию фильтра из списка");
    } else {
        var filterTypeId = tempFiltersArr['filter-types']["add"]["filter_type"]["id"];
        var filterTypeName = tempFiltersArr['filter-types']["add"]["filter_type"]["name"];
        html = "";
        for (var filterOptionId in tempFiltersArr['filter-options']['add']) {
            var filterOptionName = tempFiltersArr['filter-options']['add'][filterOptionId];
            if (typeof filterTypesArr['add'][filterTypeId] === 'undefined') {
                filterTypesArr['add'][filterTypeId] = [];
            }
            filterTypesArr['add'][filterTypeId].push(parseInt(filterOptionId));
            html = html + '<li ' + 'data-filter-type-id="'  + filterTypeId + '" ' + 'data-filter-option-id="' + filterOptionId + '"' + '>' + filterTypeName + ': ' + filterOptionName + ' <span class="add-filter-cancel">Отменить</span></li>';
        }

        tempFiltersArr = {};
        $('.database-items__list[data-type="filter-types"] > ul > li').removeClass('active-item');
        $('.database-items__list[data-type="filter-options"] > ul').html("");
        $('.new-items-filter-options').show();
        $('.new-items-filter-options__list > ul').append(html);
        $('.filter-types-arr').val(JSON.stringify(filterTypesArr));
    }

}


$('body').on('click', '.add-filter-cancel', function () {
    let filterTypeId = $(this).parent().data('filter-type-id');
    let filterOptionId = $(this).parent().data('filter-option-id');
    index = filterTypesArr['add'][filterTypeId].indexOf(filterOptionId);
    delete filterTypesArr['add'][filterTypeId][index];

    filterTypesArr['add'][filterTypeId] = filterTypesArr['add'][filterTypeId].filter(function (el) {
        return el != null;
    });

    if (filterTypesArr['add'][filterTypeId].length == 0) {
        delete filterTypesArr['add'][filterTypeId];
    }

    if (Object.keys(filterTypesArr.add).length == 0) {
        $('.new-items-filter-options').hide();
    }

    $(this).parent().remove();
    $('.filter-types-arr').val(JSON.stringify(filterTypesArr));
});

$('body').on('click', '.add-filter-to-new-items', function () {
    updateFilterTypeFilterOptionAddList();
});



typeFilterOptionsAddDelete = {'add': [],'delete':[]};

//Аякс пагинация в админке
function ajaxPagination(params) {
    params['id'] = pageId;
    $.ajax({
        type: "GET",
        url: "/get-custom-relationship-items-list",
        data: params,
        success: function (data) {
            $('.old-items__list').html(data);
            $('.old-items li').css('background', 'white');
            typeFilterOptionsAddDelete['delete'].forEach(function (item) {
                markDeletedItem(item);
            });
        }
    });
}

function markDeletedItem(itemId) {
    var item = $('.item-' + itemId);
    item
        .css('background', '#ff5151')
        .css('color', 'white');

    item.find('.add-item-to-delete-items').html('будет удалено')
}

$('body').on('click', '.ajax-pagen > a', function (e) {
   e.preventDefault();
   var params = parseQueryString($(this).attr('href'));
   ajaxPagination(params);
});


//Добавление и удаление новых айтемов в админке
//Добавление в список на добавление
$('body').on('click', '.add-item-to-new-items', function () {
    addItemToNewItems($('.new-item').val());
});




function showHideAddDeleteBlock() {
    if (typeFilterOptionsAddDelete['add'].length > 0) {
        $('.new-items').show()
    } else {
        $('.new-items').hide()
    }
    if (typeFilterOptionsAddDelete['delete'].length > 0) {
        $('.delete-items').show()
    } else {
        $('.delete-items').hide()
    }
}

function addItemToNewItems(optionName) {
    //Создание
    if (!$('.delete-items').is('div')) {
        if (optionName !== '') {
            if (typeFilterOptionsAddDelete['add'].indexOf(optionName) != -1) {
                toastr.error("Вы уже добавили опцию с таким названием");
            } else {
                //Добавляется
                typeFilterOptionsAddDelete['add'].push(optionName);
                $('.new-items__list ul').append("<li>" + optionName + "</li>");
                $('.type-filter-options-add-delete').val(JSON.stringify(typeFilterOptionsAddDelete));
                showHideAddDeleteBlock();
            }
        } else {
            toastr.error("Укажите название опции");
        }
    } else {
        //редатирование
        $.ajax({
            type: "POST",
            url: "/check-option-existanse/" + pageId,
            data: {
                'option-name': optionName,
                'type': $('.custom-relation').data('type')
            },
            success: function (data) {
                if (data.exists) {
                    toastr.error("Опция с таким названием уже существует в данном типе фильтра");
                } else {
                    if (optionName !== '') {
                        if (typeFilterOptionsAddDelete['add'].indexOf(optionName) != -1) {
                            toastr.error("Вы уже добавили опцию с таким названием");
                        } else {
                            //Добавляется
                            typeFilterOptionsAddDelete['add'].push(optionName);
                            $('.new-items__list ul').append("<li>" + optionName + "</li>");
                            $('.type-filter-options-add-delete').val(JSON.stringify(typeFilterOptionsAddDelete));
                            showHideAddDeleteBlock();
                        }
                    } else {
                        toastr.error("Укажите название опции");
                    }
                }
            }
        });
    }


}





function parseQueryString(query) {
    query = query.replace('?','');
    var vars = query.split("&");
    var query_string = {};
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        var key = decodeURIComponent(pair[0]);
        var value = decodeURIComponent(pair[1]);
        // If first entry with this name
        if (typeof query_string[key] === "undefined") {
            query_string[key] = decodeURIComponent(value);
            // If second entry with this name
        } else if (typeof query_string[key] === "string") {
            var arr = [query_string[key], decodeURIComponent(value)];
            query_string[key] = arr;
            // If third or later entry with this name
        } else {
            query_string[key].push(decodeURIComponent(value));
        }
    }
    return query_string;
}


//Добавление парсинга csv в очередь

$(".shop-btn").on('click', function() {

    var shopId = $(this).closest('tr').data('id');
    $(this).attr('disabled','disabled').css('background-color', 'grey');
    $(this).closest('tr').find('.message').css('color', 'green').text('В очереди');


    $.ajax({
        type: "POST",
        url: "/add-csv-to-queue/" + shopId,
        success: function () {
            // console.log(shopId);
            // console.log(this);

        }
    });
});

//Добавление парсинга csv со скидками в очередь
$(".sales-btn").on('click', function() {

    var shopId = $(this).closest('tr').data('id');
    $(this).attr('disabled','disabled').css('background-color', 'grey');
    $(this).closest('tr').find('.message').css('color', 'green').text('В очереди');

    $.ajax({
        type: "POST",
        url: "/add-sales-csv-to-queue/" + shopId,
        success: function () {
            // console.log(shopId);
            // console.log(this);
        }
    });
});



$('body').on('click', '.delete-shop', function () {
    if(confirm('Точно удалить?')) {
        deleteShopFromProduct($(this).data('shop-id'));
        validateSave();
    }
});

$('body').on('click', '.add-shop', function () {
    var shopId = $('[data-get-items-field="product_belongstomany_shop_relationship"]').val();
    var shopName = $('[data-get-items-field="product_belongstomany_shop_relationship"] option:selected').text();
    var shopPrice = $('#shop-price').val().trim();
    var shopUrl = $('#shop-url').val().trim();
    if (shopId === "" || shopName === "") {
        toastr.error("Выберите магазин из списка");
    } else if (shopPrice === "") {
        toastr.error("Укажите цену товара");
    } else if (shopUrl === "") {
        toastr.error("Укажите ссылку на товар в оригинальном магазине");
    } else if ($('[data-shop-id = "' + shopId + '"').is('button')) {
        toastr.error("Данный магазин уже присутствует в списке");
    } else {
        addShopToProduct(shopId, shopName, shopPrice, shopUrl);
    }

    validateSave();
});
validateSave();

$('body').on('click', '.save-disabled', function (e) {
    e.preventDefault();
    toastr.error("Добавьте хотя бы один магазин");
});

function validateSave() {
    if($('#shop-price').is('input')) {
        if ($('.shop-product-rows__row').is('div')) {
            $('.save').removeClass('save-disabled');
        } else {
            $('.save').addClass('save-disabled');
        }
    }
}

//ограничения на ввод в поле "скидка"
function validate(event) {
    var theEvent = event || window.event;
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode(key);
    var regex = /[0-9]|\./;

    if (!regex.test(key)) {

        theEvent.returnValue = false;
        if (theEvent.preventDefault) theEvent.preventDefault();
        return false;
    }
}

//вставка в скидку
$('body').on('keypress paste', '#shop-price', function (event) {
    validate(event, $(this).val());
});

function addShopToProduct(shopId, shopName, shopPrice, shopUrl) {
    var row = getProductShopFieldsRowHtml(shopId, shopName, shopPrice, shopUrl);
    shopProducts[shopId] = {'shop_id': shopId, 'price': shopPrice, 'url': shopUrl};
   // shopProducts = shopProducts.filter(function () { return true });
    $('#product-shops').val(JSON.stringify(shopProducts));
    $('.shop-product-rows').append(row);
    shopProductFieldsClean();
}

function deleteShopFromProduct(shopId) {
    delete shopProducts[shopId];
    //shopProducts = shopProducts.filter(function () { return true });
    $('#product-shops').val(JSON.stringify(shopProducts));
    $('[data-shop-id="' + shopId + '"]').closest('.shop-product-rows__row').remove();
}

function shopProductFieldsClean() {
    $('#shop-price').val('');
    $('#shop-url').val('');
}


function getProductShopFieldsRowHtml(shopId, shopName, price, url) {
    return '<div class="shop-product-rows__row" style="margin-left: 5px;">\n' +
        '   <div class="form-group col-md-4">\n' + shopName  + '</div>\n' +
        '       <div class="form-group col-md-2">\n' + price + '</div>\n' +
        '       <div class="form-group col-md-4">\n' + url + '</div>\n' +
        '       <div class="form-group col-md-2">\n' +
        '       <button type="button" data-shop-id="' + shopId + '" class="btn btn-danger delete-shop" style="margin-top: 0px; font-weight: bold; font-size: 20px; padding: 0px 12px;">x</button>\n' +
        '   </div>\n' +
        '</div>'
}

jQuery.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name = "csrf-token"]').attr('content')
    }
});

//infinity scroll
$(document).ready(function() {
//Получаем тип блока, записываем offset в data-offset блока
    var block = $('.database-items__list');
    block.scroll(function() {
        block = $(this);
        var offset = parseInt(block.attr('data-offset'));
        var type = block.data('type');
        var difference = block[0].scrollHeight - block.innerHeight();
        if (typeof(pageId) === 'undefined') {
            pageId = false;
        }
        if (type == 'filter-options') {
            var url = '/get-filter-options/' + tempFiltersArr['filter-types'].add.filter_type['id'];
        } else {
            var url = '/get-items/';
            if (pageId) {
                url = url + pageId;
            }
        }
        if (difference == Math.round(block.scrollTop())) {

            $.ajax({
                method: "POST",
                url: url,
                data: {
                    'type' : type,
                    'offset' : offset
                },
                success: function (data) {
                    block.attr('data-offset', offset + 10);
                    items = "";
                    data.items.forEach(function (item) {
                        items = items + '<li data-item-id="' + item.id + '">' + item.name + "</li>";
                    });
                    block.find('ul').append(items);
                }
            });
        }
    });
});


$('body').on('click', '.approve-review', function (e) {
    e.preventDefault();
    var reviewId = $(this).closest('tr').data('id');
    var button = $(this);
    button.attr('disabled', true).css('cursor', 'wait');
    $.ajax({
        method: "POST",
        url: '/approve-review/' + reviewId,
        data: $(this).serialize(),
        success: function (data) {
            if (button.hasClass('btn-success')) {
                button.removeClass('btn-success')
                    .addClass('btn-danger')
                    .text('Скрыть');
            } else if (button.hasClass('btn-danger')) {
                button.removeClass('btn-danger')
                    .addClass('btn-success')
                    .text('Показать')
            }
            button.attr('disabled', false).css('cursor', 'pointer');
        }
    });
});
