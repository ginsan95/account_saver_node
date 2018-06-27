const express = require('express');
const tokenMiddleware = require('../middlewares/TokenMiddleware');
const userController = require('../controllers/UserController');

const router = express.Router();

router.use(tokenMiddleware);

router.get('/', userController.userData);

router.post('/changeName', userController.changeName);

module.exports = router;