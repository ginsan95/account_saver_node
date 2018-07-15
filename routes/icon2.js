const express = require('express');
const tokenMiddleware = require('../middlewares/TokenMiddleware');
const icon2Controller = require('../controllers/Icon2Controller');

const router = express.Router();

router.use(tokenMiddleware);

router.get('/', icon2Controller.icons);

router.get('/:id', icon2Controller.icon);

router.post('/upload', icon2Controller.uploadIcon);

router.post('/delete', icon2Controller.deleteIcon);

module.exports = router;
