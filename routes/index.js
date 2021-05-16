
const rp = require('request-promise');
const { Iconv } = require('iconv');
const cheerio = require('cheerio');
const express = require("express");
const router = express.Router();
const fs=require('fs');
const ejs = require('ejs');
const path = require('path');
const $ = require('jquery');
const client = require('./mysql');
const session =require('./session');
const { resolveSoa } = require('dns');
client.connect();
router.use(session);


  router.get("/", function (req, res) {
  const arr = new Array();
  arr.push(title)
  arr.push(nowprice)
  arr.push(YTrate)
  arr.push(UDrate)
  arr.push(stockvolume)
  const user = req.session.userid //세션유지
    client.query('SELECT*FROM stockboard order by views DESC limit 5',(error,hits)=>{
        client.query('SELECT*FROM coinboard order by views DESC limit 5',(error,hits2)=>{
        console.log(hits)
        res.render('index',{
            arr:arr,
            data:user,
            hits:hits,
            hits2:hits2
        })
        })
    })
  });



////////////////////////////////주식//////////////////////////////////////////////
///////메인화면 JS////////////////////////////
function anyToUtf8(str) {
    const iconv = new Iconv('EUC-KR', 'utf-8//translit//ignore');
    return iconv.convert(str).toString();
}
let title = new Array(),
    nowprice = new Array(),
    YTrate = new Array(),
    UDrate = new Array(),
    stockvolume = new Array();

var rank = 10; //10위까지 확인

rp({
    url: 'https://finance.naver.com/sise/sise_rise.nhn?sosok=0',
    encoding: null,
})

    .then(anyToUtf8)
    .then(function (htmlString) {
        let $ = cheerio.load(htmlString);

        // 종목명 파싱
        for (var i = 0; i < rank; i++) {
            $('tbody tr td:nth-child(2) a.tltle').each(function () {
                var title_info = $(this);
                var title_info_text = title_info.text();
                var title_info_text;
                title[i] = title_info_text;
                i++;
            });
        }

        // 현재가 파싱
        for (var i = 0; i < rank; i++) {
            $('tbody tr td:nth-child(3).number').each(function () {
                var nowprice_info = $(this);
                var nowprice_info_text = nowprice_info.text();
                nowprice[i] = nowprice_info_text;
                i++;
            });
        }

      
        // 전일비 파싱
        for (var i = 0; i < rank; i++) {
            $('tbody tr td:nth-child(4) span').each(function () {
                var YTrate_info = $(this);
                var YTrate_info_text = YTrate_info.text().trim();
                YTrate[i] = YTrate_info_text;
                i++;
            });
        }

        // 등락률 파싱
        for (var i = 0; i < rank; i++) {
            $('tbody tr td:nth-child(5) span').each(function () {
                var UDrate_info = $(this);
                var UDrate_info_text = UDrate_info.text().trim().replace('%','');
                UDrate[i] = UDrate_info_text;
                i++;
            });
        }

          // 거래량 파싱
          for (var i = 0; i < rank; i++) {
            $('tbody tr td:nth-child(6).number').each(function () {
                var stockvolume_info = $(this);
                var stockvolume_info_text = stockvolume_info.text();
                stockvolume[i] = stockvolume_info_text;
                i++;
            });
        }

   
        console.log('iamready!')
    })
    .catch(function (err) {
        console.log(err);
    });
    



    



module.exports = router;

