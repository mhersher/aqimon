var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jwt = require('express-jwt');
var jwksRsa = require('jwks-rsa');
var dotenv = require('dotenv').config()
var secured = require('../lib/secured_api');

var api_controller = require('../controllers/apiController');

// create application/json parser
var jsonParser = bodyParser.json()

var checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: process.env.AUTH0_URI
  }),

  // Validate the audience and the issuer.
  audience: process.env.AUTH0_AUD,
  issuer: process.env.AUTH0_ISS,
  algorithms: ['RS256']
});

// Filtered samples
router.get('/samples/:device_id/:range',api_controller.samples);

// Sample range metadata
router.get('/samples_meta/:device_id/:range', api_controller.samples_meta);

// Latest sample
router.get('/latest_sample/:device_id', api_controller.latest_sample);

// Device list
router.get('/devices', api_controller.devices);

// Sample details
router.get('/sample/:sample_id', api_controller.sample_details);

// Device details
router.get('/device/:device_id', api_controller.device_details);

// Purpleair data for device
router.get('/device/:device_id/purpleair', api_controller.purpleair);

// Create new subscription
router.post('/subscription/new',secured(),api_controller.new_subscription);

// Get subscription list
router.get('/subscription/:device_id',secured(),api_controller.subscriptions);
router.get('/subscription/',secured(),api_controller.subscriptions);

// Create new subscription
router.post('/subscription/delete/:subscription_id',secured(),api_controller.delete_subscription);

// Create new profile
router.post('/profile/new',secured(),jsonParser,api_controller.new_profile)

// Read profile
router.get('/profile/',secured(),api_controller.profile)

// Update profile
router.post('/profile/update',secured(),jsonParser,api_controller.update_profile)

// New Sample
router.post('/sample',checkJwt, api_controller.new_sample);
module.exports = router
