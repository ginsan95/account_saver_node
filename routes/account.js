const express = require('express');
const tokenMiddleware = require('../middlewares/TokenMiddleware');
const accountController = require('../controllers/AccountController');

const router = express.Router();

router.use(tokenMiddleware);

router.get('/', accountController.accounts);

router.post('/new', accountController.createAccount);

module.exports = router;