$(document).ready(function () {
    $(".menu").toggleClass("menu-hidden");
    $("#button").click(function () {
        $(".menu").toggleClass("menu-hidden");
    });
    $("#wykres").click(function () {
        window.location.href = '/';
    });
    $("#canvas").click(function () {
        window.location.href = '/canvas';
    });
    $("#config").click(function () {
        window.location.href = '/configure';
    });
});
function popUp(text, time) {
    //$(".pop-up > h1").html(text);
    $(".pop-up").fadeIn(400).delay(time).fadeOut(400);
}