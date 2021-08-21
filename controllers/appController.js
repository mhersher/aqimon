//var Sample = require('../models/device');
var db = require("../models");
var Device = db.devices;
var Sample = db.samples;
var User = db.users;
var Op = db.Sequelize.Op;
var Sequelize = db.Sequelize;
var async = require('async');

exports.index = function(req, res) {
  res.render('index', {title: 'AQIMonitor Home'})
};

exports.current_conditions = function(req,res) {
  const device_id = req.params.device_id;
  const range = req.params.range;
  res.render('current_conditions', {title: 'Hades AQI: Current Conditions', device_id: device_id, range: range})
};

exports.device_details = function(req,res) {
  const device_id = req.params.device_id;
  res.render('device_details', {title: 'Hades AQI: Device Details', device_id: device_id})
};

exports.user_details = function(req,res) {
    var { _raw, _json, ...userProfile } = req.user;
    User.findOne(
      {attributes:
        { exclude: ['createdAt','updatedAt']},
        where: {email: userProfile.emails[0]['value']}
      })
    .then(data => {
      var hades_profile;
      if (data != null) {
        hades_profile = data.dataValues
      }
      res.render('user', {
          auth0Profile: JSON.stringify(userProfile, null, 2),
          hadesProfile: hades_profile,
          title: 'Profile page'})
        }
      )
    .catch(err => {
      res.status(500).send({
        message: "Error loading user page" + err
      });
    })
;
}

exports.user_update = function(req, res) {
  const { _raw, _json, ...userProfile } = req.user;
  var user_email = userProfile.emails[0].value
  var user_profile = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    phone_country_code: req.body.country_code,
    phone_phone_number: req.body.phone_number,
    units: req.body.units,
    email: user_email
  };
  console.log(userProfile)
  User.upsert(user_profile, {
    where: {
      email: user_email
    }
  })
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "An error occurred while updating the user profile."
    });
  });
};
