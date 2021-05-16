const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const client = require('./mysql');
const session =require('./session');
router.use(session);

const client_id = 'nKchet6OefUFsmvOjV42';
const client_secret = '3gqtM2Rnl8';
const state = "RANDOM_STATE";
const redirectURI = encodeURI("http://byeonggoon.cafe24app.com/naver_oauth");

//로그인창 켜기
router.get('/',(req,res)=>{
        res.render('login');  
});


// 암호화 로그인
router.post('/', (req, res) =>{
    let userid = req.body.userid;
    let inputpassword = req.body.userpwd;
    let hashpassword = crypto.createHash("sha512").update(inputpassword).digest("hex");
        client.query('SELECT * FROM member WHERE userid = ?', [userid],  (error, results) =>{
            console.log(hashpassword);
            console.log(userid);
            if(userid==""&&inputpassword==""){
                res.send('<script>alert("정보를 입력하세요");history.back();</script>')
            }
            else if(results.length==0){
                res.send('<script>alert("존재하지 않는 아이디 입니다.");history.back();</script>')
            }else{
                if(results[0].userid == userid && results[0].userpwd == hashpassword){
                    req.session.loggedin = true;
                    req.session.userid = userid;
                    res.redirect('/');
                }else{
                    res.send('<script>alert("비밀번호가 틀렸습니다");history.back();</script>');
                } 
            }
            })
        });

//네이버 로그인
router.get('/naverlogin', function (req, res) {
    api_url = 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=' + client_id + '&redirect_uri=' + redirectURI + '&state=' + state;
    res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
    res.end("<a href='" + api_url + "'><img height='50' src='http://static.nid.naver.com/oauth/small_g_in.PNG'/></a>");
});

router.get('/callback', function (req, res) {
    code = req.query.code;
    state = req.query.state;
    api_url =
        'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=' +
        client_id +
        '&client_secret=' +
        client_secret +
        '&redirect_uri=' +
        redirectURI +
        '&code=' +
        code +
        '&state=' +
        state;
    var request = require('request');
    var options = {
        url: api_url,
        headers: { 'X-Naver-Client-Id': client_id, 'X-Naver-Client-Secret': client_secret },
    };
    request.get(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
            res.end(body);
        } else {
            res.status(response.statusCode).end();
            console.log('error = ' + response.statusCode);
        }
    });
});

//로그아웃
router.get('/logout', function (req, res) {
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


