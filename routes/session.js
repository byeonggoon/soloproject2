
const express = require("express");
const session = require('express-session')
const router = express.Router();


  router.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }));

  module.exports = router