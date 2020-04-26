//Функции инициализирующиеся или срабатывающие по document.ready
$(function () {

    $('#subscribeForm').submit(function(e) {

        e.preventDefault();

        $.ajax({
            type: "POST",
            url: $(this).attr('action'),
            data: $(this).serialize(),

            success: data => {
                $('#email, #sucsessBtn').hide();
                $('#subscrSuccsess').show();
            },

            error: function (data) {
                $('#email, #sucsessBtn').hide();
                $('#subscrSuccsess').show().text('Произошла ошибка, обновите страницу и попобуйте еще раз');
            }
        });
    });

    $('#addShop').submit(function(e) {

        $(this).find('button').css('pointer-events', 'none');

        e.preventDefault();

        $.ajax({
            type: "POST",
            url: $(this).attr('action'),
            data: $(this).serialize(),

            success: data => {
                $.magnificPopup.close();
                $('input, textarea').val('');
                $.magnificPopup.open({
                    items: {
                        src: '#thanks'
                    },
                });
            },

            error: data => {
                $.magnificPopup.close();
                $('input, textarea').val('');
                $.magnificPopup.open({
                    items: {
                        src: '#errorModal'
                    },
                });
            }
        });
    });
});
