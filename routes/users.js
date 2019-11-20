const express = require('express');
const router = express.Router();
const controller = require('../controllers/UserController');

router.get('/', controller.getUserPage);
router.post('/supplierorders', controller.getUserPage)
module.exports = router;