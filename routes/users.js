const express = require('express');
const router = express.Router();
const controller = require('../controllers/UserController');

router.get('/', controller.getUserPage);//ตรงนี้จะเรียกผ่านcontroller แทน
module.exports = router;