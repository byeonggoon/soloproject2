var express = require('express');
var router = express.Router();
const mysql = require('mysql');


const client = mysql.createConnection({
    host:'byeonggoon.cafe24app.com',
    user:'qudrns123',
    password:'kfj8Ni*QaXFnuK7',
    database:'qudrns123',
    port:'3306',
    dateStrings:'date'
  });


module.exports = client;


