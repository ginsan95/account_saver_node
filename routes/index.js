const express = require('express');
const authController = require('../controllers/AuthController');

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/register', authController.register);

router.post('/login', authController.login);

module.exports = router;
