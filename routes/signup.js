
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const client = require('./mysql');
const crypto = require('crypto');

router.get('/',(req,res)=>{
        res.render('signup');  
});



//아이디 중복검사를 위한 routes
router.post('/checkId', (req, res) =>{
    console.log('중복검사넘어가니?')
    let input_id = req.body.data;
    client.query('select * from member where userid=?',[input_id],(err,data)=>{
        console.log(err);
        console.log('data ==>',data);
  
        if(data.length == 0){
            res.send({
              re_result: true
            });
            console.log('사용 가능 ID');
        }else{
            res.send({re_result:false});
            console.log('사용 불가 ID');
        }
    });
  });

//소금뺀 암호화 회원가입
router.post('/',  (req, res)=> {
    let body = req.body;
    let inputpassword = body.userpwd;
    //let salt = Math.round((new Date().valueOf()*Math.random)) + "";
    let hashpassword = crypto.createHash("sha512").update(inputpassword).digest("hex");
    console.log(body);
    client.query('insert into member (username,userid,userpwd,useremail) values (?,?,?,?)', 
    [body.username, body.userid, hashpassword, body.useremail], function (error) {
        // 응답합니다.
        console.log(error);
        console.log([body.username, body.userid, body.userpwd, body.useremail]);
        res.redirect('/');
    });
});



module.exports = router;







