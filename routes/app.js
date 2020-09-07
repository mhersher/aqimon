var express = require('express');
var router = express.Router();

var app_controller = require('../controllers/appController');

// Home Page
router.get('/',app_controller.index);

// Device history
router.get('/device/:device_id/recent/:range',app_controller.device_history);

// Device details
router.get('/device/:device_id', app_controller.device_details);

module.exports = router
