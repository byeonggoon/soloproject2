const express = require('express');
const bodyParser = require('body-parser');
const client = require('./mysql');
const  router = express.Router();
const fs = require('fs');
const ejs = require('ejs');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const session =require('./session');
router.use(session);

////이미지 저장/////////
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.dirname(__dirname) + '/public/images/upload')
    },
    filename: function (req, file, cb) {

        cb(null, new Date().valueOf() + '' + file.originalname)
    },
    limit: { fileSize: 5 * 1024 * 1024 },
})
let upload = multer({ storage: storage })
/////////////////

 //글쓰기버튼누르면 입력창으로 이동 
  //게시판 리스트 페이지 라우터 보다 위에 위치해야지 정상작동.
  router.get('/coinwrite', (req, res,next)=>{
        res.render('coinwrite',{
         data:req.session.userid  
    })
  });

// coin게시판클릭시 뜨는 화면  
router.get('/:num',(req,res,next)=>{
    console.log(req.params.num);
    let page=req.params.num;
    let sql = 'SELECT*FROM coinboard order by no DESC ';
    client.query(sql, (error, results) => {
        res.render('coinList', { 
            user:req.session.userid, 
            //session유지한것을 user라고 칭해서 list에서 <%=user %>님에 들어가게함.
            data: results,
            page:page,
            leng:results.length-1,
            page_num:10
        });
    });
})




  /////글쓰고 작성하기 버튼 눌렀을떄 (+이미지까지)
 router.post('/coinwrite',upload.single('files'), (req, res) => {
    let body = req.body;
    //파일이 없을떄
    if(req.file == undefined){
        let sql = 'INSERT INTO coinboard (userid,cointitle,coincontent,date) VALUES(?,?,?,NOW())';
        let sql2 = 'update member set point=point+10 where userid =?';
        client.query(sql,[req.session.userid,body.cointitle,body.coincontent], (err, result) => {
            client.query(sql2,[req.session.userid],()=>{
            console.log('result==>',result); 
            res.redirect('/coin/1');
        });
    });
        //파일이 있을떄
    }else{
        //sharp(req.file.path)	// 리사이징할 파일의 경로
        sharp(req.file.path).resize({width:400, position:"left top"})
        .toFile(path.dirname(__dirname) + '/public/images/resize/'+req.file.filename)
        console.log('come here');
        // console.log('post 왔음')
        console.log(req.file.filename)
        let sql = 'INSERT INTO coinboard (userid,cointitle,coincontent,date,imageurl) VALUES(?,?,?,NOW(),?)';
        let sql2 = 'update member set point=point+20 where userid =?';
        client.query(sql,[req.session.userid,body.cointitle,body.coincontent,req.file.filename], (err, result) => {
            client.query(sql2,[req.session.userid],()=>{
            console.log('result==>',result); 
            res.redirect('/coin/1');
            })
        })
    }
});


////////////////////////////////////////////////////////////////////////
//댓글달기버튼 누를때 
router.post('/detail/:no', (req, res) => {
    client.query('INSERT INTO coincomment (userid,comcontent,date,pmno)values(?,?,NOW(),?)', [req.session.userid, req.body.adcomment, req.params.no], (err, rows) => {
        client.query('update member set point=point+5 where userid =?', [req.session.userid], () => {
            if (err) throw error;
            res.redirect('/coin/1');
        }); // 댓글달기입력누르면 리스트페이지로 넘어감.
    });
});
///////////////////////////////////////////////////////////////////
//글목록에서 제목을 클릭하면 내용이 보이는 창으로 
router.get('/detail/:no', (req, res, next) => {
    let sql = 'SELECT*FROM coinboard WHERE no= ?';
    let sql2 = 'update coinboard set views=views+1 WHERE no = ?';
    let re = 'SELECT*FROM coincomment WHERE pmno =? order by comno DESC'
    client.query(sql, [req.params.no], (error, result) => {
        client.query(sql2, [req.params.no], () => {
            client.query(re,[req.params.no],(err,data2)=>{
            //views올리는 sql2를 이전의 sql1하는 쿼리문 안에 써서
            //sql1이 넘어가는 행동을 할때 
            //sql2가 작동을 하면서 조회수가 올라가가고
            // () => { 
            // 안에 빈값을 주고 뒤에 다른 것을 안적어주면
            //따로 데이터가 보내지는게 없어서 정상작동한다.
            console.log(result)
            res.render('coindetail', {
                data: result,
                data2:data2,
                user:req.session.userid
                });
            });
        });
    });
});

/////////////////////////////////////////////////////////
    
    
    //수정페이지에서 수정하기를 누르면.
    router.post('/update/:noText',(req,res,next)=>{
        console.log('here?')
        let sql = 'update coinboard set cointitle=?, coincontent=? where no =?'
        const number = (req.params.noText);
        client.query(sql,[req.body.cointitle, req.body.coincontent,number],
            (error,results)=>{
                res.redirect('/coin/1')
            })
        })


 //삭제버튼 누르면 데이터에서 삭제되고 글목록으로 
        router.get('/delete/:noTex' ,(req,res,next)=>{
            const number =(req.params.noTex);
            client.query('DELETE FROM coinboard WHERE no=?',[number],()=>{
                res.redirect('/coin/1');
            })
        });

//수정 버튼을 누르면 수정하는 페이지로 이동
router.get('/update/:noText',(req,res,next)=>{ 
    console.log('herer?')
    let sql = "SELECT*FROM coinboard WHERE no =? "
    let number = (req.params.noText);
    client.query(sql,[number],(error,results)=>{
        let session = req.session.userid;
        let userid = results[0].userid;
        if(session == userid){
            res.render('coinupdate',{
                data:results
            })
        }else{
            res.send('<script>alert("해당 작성자가 아닙니다.");history.back();</script>')
        }
    })
})

// // //찾기버튼 눌렀을때 보이는 list페이지 
router.post('/coinsearch/:num',  (req, res)=> {
    let body = req.body;
    let page = req.params.num;
    console.log('aa')
        client.query('SELECT * FROM coinboard where cointitle like ? ORDER BY No DESC', ['%' + body.coinsearch + '%'],  (error, results) =>{
            console.log('results',results)
            let session = req.session.userid;
            res.render('coinsearch', {
                user: session,
                data: results,
                page:page,
                leng:results.length-1,
                page_num:10,
                pass:true,
                search:body.coinsearch
            });
        });
});

router.get('/coinsearch/:coinsearch/:num',  (req, res)=> {
    let body = req.body;
    let page = req.params.num;
    let search = req.params.coinsearch;
    console.log('search1')
    console.log('aa',search)
        client.query('SELECT * FROM coinboard where cointitle like ? ORDER BY No DESC', ['%' + search+'%'],  (error, results)=>{
            let session = req.session.userid;
            console.log('search2',results)
            res.render('coinsearch', {
                user: session,
                data: results,
                page:page,
                leng:results.length-1,
                page_num:10,
                pass:true,
                search:search
            });
        });
});
 

  module.exports = router;


 