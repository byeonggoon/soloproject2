const express = require('express');
const router = express.Router();
const session =require('./session');
const client = require('./mysql');
router.use(session);




    router.get('/', (req, res) => {
        let session = req.session.userid;
        client.query('SELECT * FROM stockboard where userid like ?', [session], (error, results) => {
            client.query('SELECT * FROM coinboard where userid like ?', [session], (error, results2) => {
                client.query('SELECT * FROM member where userid  like ? ', [session], (error, results3) => {
                    console.log(results3);
                    res.render('mypage', {
                        user: session,
                        data: results,
                        data2: results2,
                        data3: results3,
                    });
                });
            });
        });
    });





module.exports = router;