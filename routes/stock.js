const express = require('express');
// const mysql = require('./mysql');
const bodyParser = require('body-parser');
const client = require('./mysql');
const  router = express.Router();
const fs = require('fs');
const ejs = require('ejs');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const session =require('./session');
const { response } = require('express');
router.use(session);


/////이미지 저장/////////
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.dirname(__dirname) + '/public/images/upload')
    },
    filename: function (req, file, cb) {

        cb(null, new Date().valueOf() + '' + file.originalname)
    },
    limit: { fileSize: 5 * 1024 * 1024 },
})
const upload = multer({ storage: storage })
/////////////////


//////////////////////////////////////////////////////////////////////
  //글쓰기버튼누르면 입력창으로 이동 
  //게시판 리스트 페이지 라우터 보다 위에 위치해야지 정상작동.
  router.get('/stockwrite', (req, res,next)=>{
    // client.query('SELECT*FROM member WHERE userid = ?', (error,data)=>{ 
        res.render('stockwrite',{
         data:req.session.userid  
         // session가져와서 data로 받아서 stockwrite.ejs에서 작성자에  data값으로 들어간다.
    // });
    })
  });

  ///////////////////////////////////////////////////////////////////
  //게시판 리스트 페이지  // 주식게시판클릭시 뜨는 화면 
  router.get('/:num',(req,res,next)=>{
    console.log(req.params.num);
    let page=req.params.num;
    const sql = 'SELECT*FROM stockboard order by no DESC ';
    client.query(sql, (error, results) => {
        res.render('stockList', { 
            user:req.session.userid, 
            //session유지한것을 user라고 칭해서 list에서 <%=user %>님에 들어가게함.
            data: results,
            page:page,
            leng:results.length-1,
            page_num:10
        });
    });
})

///////////////////////////////////////////////////////////////////
    /////글쓰고 작성하기 버튼 눌렀을떄 (+이미지까지)
 router.post('/stockwrite',upload.single('files'), (req, res) => {
        const body = req.body;
        //파일이 없을떄
        if(req.file == undefined){
            let sql = 'INSERT INTO stockboard (userid,stocktitle,stockcontent,date) VALUES(?,?,?,NOW())';
            let sql2 = 'update member set point=point+10 where userid =?';
            client.query(sql,[req.session.userid,body.stocktitle,body.stockcontent], (err, result) => {
                client.query(sql2,[req.session.userid],()=>{
                console.log(req.session.userid);
                    res.redirect('/stock/1');
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
            let sql = 'INSERT INTO stockboard (userid,stocktitle,stockcontent,date,imageurl) VALUES(?,?,?,NOW(),?)';
            let sql2 = 'update member set point=point+20 where userid =?';
            client.query(sql,[req.session.userid,body.stocktitle,body.stockcontent,req.file.filename], (err, result) => {
                client.query(sql2,[req.session.userid],()=>{
                console.log('result==>',result); 
                res.redirect('/stock/1');
            })
        });
        }
    });


///////////////////////////////////////////////////////////////////
//댓글달기버튼 누를때 
router.post('/detail/:no', (req, res) => {
    client.query('INSERT INTO stockcomment (userid,comcontent,date,pmno)values(?,?,NOW(),?)', [req.session.userid, req.body.adcomment, req.params.no], (err, rows) => {
        client.query('update member set point=point+5 where userid =?', [req.session.userid], () => {
            if (err) throw error;
            res.redirect('/stock/1');
        }); // 댓글달기입력누르면 리스트페이지로 넘어감.
    });
});

///////////////////////////////////////////////////////////////////
//글목록에서 제목을 클릭하면 내용이 보이는 창으로 
router.get('/detail/:no', (req, res, next) => {
    let sql = 'SELECT*FROM stockboard WHERE no= ?';
    let sql2 = 'update stockboard set views=views+1 WHERE no = ?';
    let re = 'SELECT*FROM stockcomment WHERE pmno =? order by comno DESC'
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
            res.render('stockdetail', {
                data: result,
                data2:data2,
                user:req.session.userid
                });
            });
        });
    });
});


    
///////////////////////////////////////////////////////////////////
    //수정페이지에서 글을 수정하고 수정하기를 누르면.
    router.post('/update/:noText',(req,res,next)=>{
        console.log('here?')
        let sql = 'update stockboard set stocktitle=?, stockcontent=? where no =?'
        const number = (req.params.noText);
        client.query(sql,[req.body.stocktitle, req.body.stockcontent,number],
            (error,results)=>{
                res.redirect('/stock/1')
            })
        })

///////////////////////////////////////////////////////////////////
 //삭제버튼 누르면 데이터에서 삭제되고 글목록으로 
        router.get('/delete/:noTex' ,(req,res,next)=>{
            const number =(req.params.noTex);
            let session = req.session.userid;
            client.query('DELETE FROM stockboard WHERE no=?',[number],()=>{
                res.redirect('/stock/1');
            })
        });
///////////////////////////////////////////////////////////////////
//수정 버튼을 누르면 수정하는 페이지로 이동
router.get('/update/:noText',(req,res,next)=>{ 
    console.log('herer?')
    let sql = "SELECT*FROM stockboard WHERE no =? "
    const number = (req.params.noText);
    client.query(sql,[number],(error,results)=>{
        let session = req.session.userid;
        let userid = results[0].userid;
        if(session == userid){
            res.render('stockupdate',{
                data:results
            })
        }else{
            //res.redirect('/stock/1')
            res.send('<script>alert("해당 작성자가 아닙니다.");history.back();</script>')
        }
    })
})


/////////////////////////////////////////////////////////////////





// // //찾기버튼 눌렀을때 보이는 list페이지 
router.post('/stocksearch/:num',  (req, res)=> {
    var body = req.body;
    var page = req.params.num;
    console.log('aa')
        client.query('SELECT * FROM stockboard where stocktitle like ? ORDER BY No DESC', ['%' + body.stocksearch + '%'],  (error, results) =>{
            console.log('results',results)
            let session = req.session.userid;
            res.render('stocksearch', {
                user: session,
                data: results,
                page:page,
                leng:results.length-1,
                page_num:10,
                pass:true,
                search:body.stocksearch
            });
        });
});

router.get('/stocksearch/:stocksearch/:num',  (req, res)=> {
    var body = req.body;
    var page = req.params.num;
    var search = req.params.stocksearch;
    console.log('search1')
    console.log('aa',search)
        client.query('SELECT * FROM stockboard where stocktitle like ? ORDER BY No DESC', ['%' + search+'%'],  (error, results)=>{
            let session = req.session.userid;
            console.log('search2',results)
            res.render('stocksearch', {
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




