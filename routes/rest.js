const express = require('express');
const authController = require('../controllers/AuthController');

const userRouter = require('./user');
const accountRouter = require('./account');

const router = express.Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.use('/user', userRouter);

router.use('/account', accountRouter);

module.exports = router;
