$(function () {
    $('.header__search').submit(e => {
       e.preventDefault();
       if ($('#search-input').val() !== "") {
           window.location.href = "/search?query=" + $('#search-input').val();
       }
    });
});
