//var Sample = require('../models/sample');
var db = require("../models");
var Sample = db.samples;
var Op = db.Sequelize.Op;
var Sequelize = require('sequelize')

// Display page for a specific meter
//exports.sample_detail = function(req, res) {
//  res.send('Not implemented: Sample detail: ' + req.params.id);
//};


exports.sample_detail = function(req, res) {
  const id = req.params.id;

  Sample.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving sample with id " + id
      });
    });
};

exports.recent_samples = function(req, res) {
  var window = req.params.window;
  Sample.findAll({
    attributes: { exclude: ['createdAt','updatedAt']},
    //where: Sequelize.where(Sequelize.col('measurement_time')+window, {[Op.gte]: Sequelize.fn('utc_timestamp')})
    where: Sequelize.where(Sequelize.fn('timestampdiff',Sequelize.literal('MINUTE'), Sequelize.col('measurement_time'), Sequelize.fn("utc_timestamp")), {[Op.lte] : window}),
    order: [['measurement_time','DESC']]
  }).then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "Error occured while retrieving samples."
    });
  });
};

exports.findAll = (req, res) => {
  const title = req.query.title;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  Tutorial.findAll({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
};

// Create and Save a new sample
exports.sample_create = (req, res) => {
  const measurement_parsed = Date.parse(req.body.measured_at)
  if (req.body.humidity) {
    var humidity = req.body.humidity
  }
  else {
    var humidity = req.body.baro
  }
  const sample = {
    device_id: req.body.device_id,
    measurement_time: measurement_parsed,
    pm10aqi: req.body.pm10aqi,
    pm10raw: req.body.pm10raw,
    pm25aqi: req.body.pm25aqi,
    pm25raw: req.body.pm25raw,
    temp: req.body.temp,
    humidity: humidity
  };

  // Save Tutorial in the database
  Sample.create(sample)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "An error occurred while creating the sample."
      });
    });
};

exports.samples_filtered = function(req, res) {
  const device_id = req.params.id;
  const range = req.params.range;

  Sample.findAll(
    {
      attributes: { exclude: ['createdAt','updatedAt']},
      where: {
          [Op.and]: [
            { device_id: device_id },
            Sequelize.where(Sequelize.fn('timestampdiff',Sequelize.literal('MINUTE'), Sequelize.col('measurement_time'), Sequelize.fn("utc_timestamp")), {[Op.lte] : range})
          ]
      },
      order: [['measurement_time','DESC']]
  })
  .then(data => {
    console.log(data);
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "Error occured while retrieving samples."
    });
  });
};
