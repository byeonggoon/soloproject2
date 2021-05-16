$(document).ready(function (e) {
    $('#userpoint').focusout(() => {
        let howpoint = $('#userpoint').val();
        if (howpoint < 11) {
            $('.levelcheck').html('초보!');
        } else if (howpoint < 21) {
            $('.levelcheck').html('중수!');
        } else {
            $('.levelcheck').html('고수!');
        }
    });
});


