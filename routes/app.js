var express = require('express');
var router = express.Router();
var secured = require('../lib/secured');
var app_controller = require('../controllers/appController');

// Home Page
router.get('/',app_controller.index);

// Device history
router.get('/device/:device_id/recent/:range',app_controller.current_conditions);

// Device details
router.get('/device/:device_id', app_controller.device_details);

// User details
router.get('/user', secured(), app_controller.user_details);

// Update user profile
router.post('/user', secured(), app_controller.user_update);

module.exports = router
