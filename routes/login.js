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


