const fs = require('fs');
const ejs = require('ejs');
const mysql = require('mysql');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const html = require('html');
var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



//use 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));// 때문에 index.ejs에서 css파일을 설정할때 상위링크인 public을 걸지 않아도 된다. 





//라우팅
const indexRouter = require('./routes/index');
const signupRouter = require('./routes/signup');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const stockRouter = require('./routes/stock');
const coinRouter = require('./routes/coin');
const mypageRouter = require('./routes/mypage');

app.use('/', indexRouter);
app.use('/signup',signupRouter);
app.use('/login',loginRouter);
app.use('/logout',logoutRouter);
app.use('/stock',stockRouter);
app.use('/coin',coinRouter);
app.use('/mypage',mypageRouter);






app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

app.listen(()=>{
  console.log('ready');
});