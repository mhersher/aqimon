var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var jwksRsa = require('jwks-rsa');
var dotenv = require('dotenv').config()
//var helmet = require('helmet')

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

var device_controller = require('../controllers/deviceController');
var sample_controller = require('../controllers/sampleController');

// Get home page
router.get('/',device_controller.device_list);

// Get for samples by device and range
router.get('/device/:id/samples/:window',device_controller.device_samples);

// Get for recent samples
router.get('/sample/recent/:window', sample_controller.recent_samples);

// Get for sample
router.get('/sample/:id/',sample_controller.sample_detail);

router.use(checkJwt);
// Post for sample
router.post('/sample/create',sample_controller.sample_create);


module.exports = router;
