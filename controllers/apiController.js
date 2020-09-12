var db = require("../models");
var Device = db.devices;
var Sample = db.samples;
var Op = db.Sequelize.Op;
var Sequelize = db.Sequelize;
var async = require('async');
var axios = require('axios');

function formatTimeDiff(milliseconds) {
  const minutes = Math.floor(milliseconds / (60000)),
  hours = Math.floor(minutes/60),
  days = Math.floor(hours/24);
  if (days > 0) {
    return days+' Days, '+(hours-(days*24))+' Hours'
  }
  else if (hours > 0) {
    return hours+' Hours, '+(minutes-(hours*60))+' Minutes'
  }
  else {
    return minutes+' Minutes'
  }
}

function getPurpleAirData(device_id) {
  return new Promise((resolve, reject) => {
    Device.findByPk(device_id)
    .then(data => {
      const pa_devices = JSON.parse(data.dataValues.nearest_purpleair);
      const purpleair_url = 'https://www.purpleair.com/json?show='+pa_devices.join('|')
      axios.get(purpleair_url)
      .then(function (response) {
        var data = response.data.results;
        ids = []
        raw_pm10 = []
        raw_pm25 = []
        raw_temp = []
        raw_hum = []
        raw_pres = []
        data.forEach(
          record => {
            const meter_id = record.ID
            const last_seen = record.LastSeen*1000
            if (Math.abs(Date.now() - last_seen) <= 300000) {
              raw_pm10.push(parseFloat(record.pm2_5_atm));
              raw_pm25.push(parseFloat(record.pm10_0_atm));
              if (record.temp_f) {
                  raw_temp.push(parseFloat(record.temp_f));
              }
              if (record.humidity) {
                raw_hum.push(parseFloat(record.humidity));
              }
              if (record.pressure) {
                raw_pres.push(parseFloat(record.pressure));
              }
            }
            ids.push(meter_id)
          }
        )
        var averages = {}
        if (raw_pm25.length > 0) {
            averages.raw_pm25 = raw_pm25.reduce(function(a,b) { return a+b })/raw_pm25.length;
        }
        if (raw_pm10.length > 0) {
            averages.raw_pm10 = raw_pm10.reduce(function(a,b) { return a+b })/raw_pm10.length;
        }
        if (raw_temp.length > 0) {
            averages.raw_temp = ((raw_temp.reduce(function(a,b) { return a+b })/raw_temp.length)-32)*5/9;
        }
        if (raw_hum.length > 0) {
            averages.raw_hum = raw_hum.reduce(function(a,b) { return a+b })/raw_hum.length;
        }
        if (raw_pres.length > 0) {
            averages.raw_pres = raw_pres.reduce(function(a,b) { return a+b })/raw_pres.length;
        }
        resolve(averages);
      })
      .catch(err => {reject(err)})
    }
  )}
)}

exports.purpleair = function (req, res) {
  const device_id = req.params.device_id
  getPurpleAirData(device_id)
  .then(function (result) {
    res.send(result);
  })
  .catch(err => {
    console.log(err);
    res.send('Error getting PurpleAir for device')
  })
}

exports.samples = function(req, res) {
  const device_id = req.params.device_id;
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
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "Error occured while retrieving samples."
    });
  });
};

exports.samples_meta = function(req,res) {
  const device_id = req.params.device_id;
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
    /* Where all of the meta calculating goes */
    raw_values = {}
    raw_values.pm25aqi = []
    raw_values.pm10aqi = []
    raw_values.temp = []
    raw_values.humidity = [];
    data.forEach(
      (sample) => {
          measurement_time_string = sample.dataValues.measurement_time.toISOString()
          pm25aqi = sample.dataValues.pm25aqi
          pm10aqi = sample.dataValues.pm10aqi
          temp = sample.dataValues.temp
          humidity = sample.dataValues.humidity
          raw_values.pm25aqi.push(pm25aqi)
          raw_values.pm10aqi.push(pm10aqi)
          raw_values.temp.push(temp)
          raw_values.humidity.push(humidity);
        }
    );
    var meta = {}
    meta.pm10aqi = {}
    meta.pm25aqi = {}
    meta.temp = {}
    meta.humidity = {}
    meta.sample_count = raw_values.pm25aqi.length;
    if (raw_values.pm25aqi.length > 0) {
      meta.pm10aqi.min = Math.min(...raw_values.pm10aqi)
      meta.pm10aqi.max = Math.max(...raw_values.pm10aqi)
      meta.pm10aqi.avg = Math.round(raw_values.pm10aqi.reduce(function(a,b) { return a+b })/raw_values.pm10aqi.length)
      meta.pm25aqi.min = Math.min(...raw_values.pm25aqi)
      meta.pm25aqi.max = Math.max(...raw_values.pm25aqi)
      meta.pm25aqi.avg = Math.round(raw_values.pm25aqi.reduce(function(a,b) { return a+b })/raw_values.pm25aqi.length)
      meta.temp.min = Math.round(Math.min(...raw_values.temp))
      meta.temp.max = Math.round(Math.max(...raw_values.temp))
      meta.temp.avg = Math.round(raw_values.temp.reduce(function(a,b) { return a+b })/raw_values.temp.length)
      meta.humidity.min = Math.round(Math.min(...raw_values.humidity))
      meta.humidity.max = Math.round(Math.max(...raw_values.humidity))
      meta.humidity.avg = Math.round(raw_values.humidity.reduce(function(a,b) { return a+b })/raw_values.humidity.length)
    }
    res.send(meta);
  })
  .catch(err => {
    console.log(err);
    res.status(500).send({
      message:
        err.message || "Error occured while retrieving samples."
    });
  });

  /*
  Should add:
    % of time in each range (Healthy, Moderate, etc) for PM2.5 and PM10 AQI
  */
};

exports.latest_sample = function(req,res) {
  const device_id = req.params.device_id
  Sample.findOne(
    {attributes:
      { exclude: ['createdAt','updatedAt']},
      where: {device_id: device_id},
      order: [['measurement_time','DESC']]
    })
  .then(data => {res.send(data);})
  .catch(err => {
    res.status(500).send({
      message: "Error retrieving most recent sample: " + err
    });
  })
};

exports.devices = function(req,res) {
  Sample.findAll({
  attributes:
  [[Sequelize.fn('MAX',Sequelize.col('id')), 'id']],
  group: 'device_id'
  })
  //.then(data => { console.log(data) })
  .then(data => {
    const ids = data.map( data => {
      return data.id
    });
    Sample.findAll({
      include: [{
        model:Device
      }],
      where: {
        id: {
          [Op.in]: ids
        }
      }
    })
    .then(data => {
      device_table_data = []
      data.forEach(
        (record) => {
          device_details = {
            'name':record.dataValues.device.dataValues.name,
            'id':record.dataValues.device.dataValues.id,
            'pm25aqi':record.dataValues.pm25aqi,
            'pm10aqi':record.dataValues.pm10aqi,
            'temp':Math.round(record.dataValues.temp),
            'humidity':Math.round(record.dataValues.humidity),
            'pa_pm10raw':record.dataValues.pa_pm10raw,
            'pa_pm25raw':record.dataValues.pa_pm25raw,
            'pm25raw':record.dataValues.pm25raw,
            'pm10raw':record.dataValues.pm10raw,
            'pa_pressure':record.dataValues.pa_pressure,
            'last_sample_time':record.dataValues.measurement_time.toISOString(),
            'sample_age': formatTimeDiff(Math.abs(Date.now() - record.dataValues.measurement_time))
          }
          device_table_data.push(device_details)
        }
      )
      res.send(device_table_data)
    })
    .catch(err => {console.log(err); res.send('Error retrieving device list')});
  });
};

exports.new_sample = function(req,res) {
  const measurement_parsed = Date.parse(req.body.measured_at)
  if (req.body.humidity) {
    var humidity = req.body.humidity
  }
  else {
    var humidity = req.body.baro
  }
  var sample = {
    device_id: req.body.device_id,
    measurement_time: measurement_parsed,
    pm10aqi: req.body.pm10aqi,
    pm10raw: req.body.pm10raw,
    pm25aqi: req.body.pm25aqi,
    pm25raw: req.body.pm25raw,
    temp: req.body.temp,
    humidity: humidity
  };
  getPurpleAirData(req.body.device_id)
  .then(function (data) {
    sample.pa_pm25raw = data.raw_pm25
    sample.pa_pm10raw = data.raw_pm10
    sample.pa_temp = data.raw_temp
    sample.pa_humidity = data.raw_hum
    sample.pa_pressure = data.raw_pres
  })
  .catch(err => {console.log(err);})
  .finally(function () {     // Save sample to DB
      Sample.create(sample)
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "An error occurred while creating the sample. Sample not saved."
          });
        });})


};

exports.sample_details = function(req,res) {
  /*
  Should return:
    Standard sample fields
    Increase/decrease since previous sample for each field
  */
  const sample_id = req.params.sample_id;

  Sample.findByPk(sample_id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving device with id " + id
      });
    });
};

exports.device_details = function(req,res) {
  const device_id = req.params.device_id;
  Sample.findOne({
  attributes:
  [[Sequelize.fn('MAX',Sequelize.col('id')), 'id']],
  where: {device_id:device_id}
  })
  .then(data => {
    const sample_id = data.id;
    Sample.findAll({
      include: [{
        model:Device
      }],
      where: {
        id: sample_id
      }
    })
    .then(data => {
      const sample = data[0].dataValues
      console.log(data)
      device_details = {
        'name':sample.device.dataValues.name,
        'id':sample.device.dataValues.id,
        'lat':sample.device.lat,
        'lng':sample.device.lng,
        'state':sample.device.state,
        'indoors':sample.device.indoors,
        'pm25aqi':sample.pm25aqi,
        'pm10aqi':sample.pm10aqi,
        'pm25raw':sample.pm25raw,
        'pm10raw':sample.pm10raw,
        'pa_pm10raw':sample.pa_pm10raw,
        'pa_pm25raw':sample.pa_pm25raw,
        'pa_pressure':sample.pa_pressure,
        'pa_temp':sample.pa_temp,
        'pa_humidity':sample.pa_humidity,
        'temp':Math.round(sample.temp),
        'humidity':Math.round(sample.humidity),
        'last_sample_time':sample.measurement_time.toISOString(),
        'sample_age': formatTimeDiff(Math.abs(Date.now() - sample.measurement_time))
          }
      res.send(device_details)
    })
    .catch(err => {console.log(err); res.send('Error retrieving device details')})

  })
  .catch(err => {console.log(err); res.send('Error retrieving most recent sample for device')})
  /*
  Device.findByPk(device_id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving device with id " + id
      });
    });
    */

};
