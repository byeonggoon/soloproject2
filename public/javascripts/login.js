function login() {
    var id = document.getElementById('input-id').value;
    var pwd = document.getElementById('input-pwd').value;
    if(id.length=="" && pwd.length==""){
        alert('정보를 입력하세요');
    }else if (id.length >= 6) {
        if (pwd.length >= 8) {
            console.log('로그인 시도');  
        } else {
            alert('비밀번호 8자리 이상 입력부탁드립니다.');
        }
    } else {
        alert('아이디 6자리 이상 입력부탁드립니다.');
    }
}


$(".menu-bar ul li").hover(function () {
    $(this).find("ul").stop().fadeToggle(300);
});



function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


