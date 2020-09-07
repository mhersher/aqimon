var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var jwksRsa = require('jwks-rsa');
var dotenv = require('dotenv').config()
//var helmet = require('helmet')

var api_controller = require('../controllers/apiController');

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
router.get('/device/:device_id/purpleair', api_controller.purpleair)

// New sample
router.use(checkJwt);

router.post('/sample', api_controller.new_sample);
module.exports = router
