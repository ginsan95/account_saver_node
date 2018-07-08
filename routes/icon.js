const express = require('express');
const tokenMiddleware = require('../middlewares/TokenMiddleware');
const iconController = require('../controllers/IconController');

const router = express.Router();

router.use(tokenMiddleware);

router.get('/', iconController.icons);

router.post('/upload', iconController.uploadIcon);

router.post('/delete', iconController.deleteIcon);

module.exports = router;
