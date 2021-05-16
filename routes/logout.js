
var express = require('express');
var router = express.Router();

const session = require('express-session')




//로그아웃
router.get('/', function (req, res) {
    // 파일을 읽습니다.
    console.log(req.session);
    req.session.destroy(function () {
        req.session;
    });
    res.clearCookie("sid") // 세션 쿠키 삭제
    res.redirect('/');
    res.end();
});


module.exports = router;
