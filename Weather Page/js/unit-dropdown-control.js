
/**
 * Sets the text of the dropdown to the default active value.
 */
$(document).ready(function () {
    $('#unitDropdownBtn #unitText').prepend($('#unitDropdownMenu li .active').text());
})

/**
 * Sets the active dropdown item and the text of the dropdown button
 * to the active item.
 */
$('.unitDropdownItem').click(function ( ) {

    $('.unitDropdownItem').removeClass("active");
    $(this).addClass("active");

    $('#unitDropdownBtn #unitText').text("");
    $('#unitDropdownBtn #unitText').prepend($('#unitDropdownMenu li .active').text());

})