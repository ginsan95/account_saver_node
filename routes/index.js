const express = require('express');
const restRouter = require('./rest')

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.use('/rest', restRouter);

module.exports = router;
