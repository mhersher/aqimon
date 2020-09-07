//var Sample = require('../models/device');
var db = require("../models");
var Device = db.devices;
var Sample = db.samples;
var Op = db.Sequelize.Op;
var Sequelize = db.Sequelize;
var async = require('async');

exports.index = function(req, res) {
  res.render('index', {title: 'AQIMonitor Home'})
};

exports.device_history = function(req,res) {
  const device_id = req.params.device_id;
  const range = req.params.range;
  res.render('device_history', {title: 'AQIMonitor Home', device_id: device_id, range: range})
};

exports.device_details = function(req,res) {
  res.send('Not yet built')
};
