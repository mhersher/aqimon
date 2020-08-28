//var Sample = require('../models/device');
var db = require("../models");
var Device = db.devices;
var Sample = db.samples;
var Op = db.Sequelize.Op;
var Sequelize = db.Sequelize;
var async = require('async');

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

exports.index = function(req,res) {
  Promise.all([
    Sample.findOne({attributes: { exclude: ['createdAt','updatedAt']},
      order: [['measurement_time','DESC']]
    })
    .then(data => {return data;})
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving most recent sample: " + err
      });
    })
    ,Sample.count()
    .then(sample_count => {return sample_count;})
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving sample count"
      });
    })
    ,Device.count()
    .then(device_count => {return device_count;})
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving device count"
      });
    })
  ])
  .then(([most_recent_sample, sample_count, device_count]) => {
    const measurement_time_localized = most_recent_sample.measurement_time.toLocaleString();
    const page_data = {'pm25aqi':most_recent_sample.pm25aqi,
    'pm10aqi':most_recent_sample.pm10aqi,
    'temp':most_recent_sample.temp,
    'humidity':most_recent_sample.humidity,
    'measurement_time_local': measurement_time_localized,
    'measurement_time_utc':most_recent_sample.measurement_time,
    'device_id':most_recent_sample.device_id,
    'total_samples':sample_count,
    'total_devices':device_count};
    //res.send(page_data);
    res.render('index', { title: 'AQI Monitor Home', data: page_data });
  })
  .catch(err => {
    res.status(500).send({
      message: "Error retrieving data for page"
    });
  });
};

exports.device_detail = function(req, res) {
  const id = req.params.id;

  Device.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving device with id " + id
      });
    });
};

exports.device_samples = function(req, res) {
  const window = req.params.window;
  const device_id = req.params.id;

  Promise.all([
    Sample.findAll({
    attributes: { exclude: ['createdAt','updatedAt']},
    where: {
        [Op.and]: [
          { device_id: device_id },
          Sequelize.where(Sequelize.fn('timestampdiff',Sequelize.literal('MINUTE'), Sequelize.col('measurement_time'), Sequelize.fn("utc_timestamp")), {[Op.lte] : window})
        ]
    },
    order: [['measurement_time','DESC']]
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "Error occured while retrieving samples."
    });
  }),
  Device.findByPk(device_id),
  Sample.findOne({attributes: {exclude: ['createdAt, updatedAt']},
  where: {
       device_id: device_id
  }
,order: [['measurement_time', 'DESC']]})])
  .then(([sample_data, device_info,most_recent_sample]) => {
    formatted_sample_data = {}
    raw_values = {}
    raw_values.pm25aqi = []
    raw_values.pm10aqi = []
    raw_values.temp = []
    raw_values.humidity = []
    summary_stats = {}
    summary_stats.pm10aqi = {}
    summary_stats.pm25aqi = {}
    summary_stats.temp = {}
    summary_stats.humidity = {}
    d3_data = []
    sample_data.forEach(
      (sample) => {
          const for_d3_obj = {}
          measurement_time_string = sample.dataValues.measurement_time.toISOString()
          pm25aqi = sample.dataValues.pm25aqi
          pm10aqi = sample.dataValues.pm10aqi
          temp_c = sample.dataValues.temp
          temp_f = sample.dataValues.temp*9/5+32
          humidity = sample.dataValues.humidity
          raw_values.pm25aqi.push(pm25aqi)
          raw_values.pm10aqi.push(pm10aqi)
          raw_values.temp.push(temp_c)
          raw_values.humidity.push(humidity)
          for_d3_obj['measurement_time']= measurement_time_string
          for_d3_obj['PM2.5 AQI']= pm25aqi
          for_d3_obj['PM10 AQI']= pm10aqi
          for_d3_obj['temp_c']=temp_c
          for_d3_obj['temp_f']=temp_f
          for_d3_obj['humidity']=humidity
          d3_data.push(for_d3_obj);
          formatted_sample_data[sample.dataValues.id]={
          'pm10aqi':sample.dataValues.pm10aqi,
          'pm25aqi':sample.dataValues.pm25aqi,
          'temp_c':Math.round(sample.dataValues.temp*2)/2,
          'temp_f':Math.round(sample.dataValues.temp*9/5+32),
          'humidity':Math.round(sample.dataValues.humidity),
          'measurement_time_localized':sample.dataValues.measurement_time.toLocaleString()};
          }
    )
    if (raw_values.pm25aqi.length > 0) {
      summary_stats.pm10aqi.min = Math.min(...raw_values.pm10aqi)
      summary_stats.pm10aqi.max = Math.max(...raw_values.pm10aqi)
      summary_stats.pm10aqi.avg = Math.round(raw_values.pm10aqi.reduce(function(a,b) { return a+b })/raw_values.pm10aqi.length)
      summary_stats.pm25aqi.min = Math.min(...raw_values.pm25aqi)
      summary_stats.pm25aqi.max = Math.max(...raw_values.pm25aqi)
      summary_stats.pm25aqi.avg = Math.round(raw_values.pm25aqi.reduce(function(a,b) { return a+b })/raw_values.pm25aqi.length)
      summary_stats.temp.min = Math.round(Math.min(...raw_values.temp))
      summary_stats.temp.max = Math.round(Math.max(...raw_values.temp))
      summary_stats.temp.avg = Math.round(raw_values.temp.reduce(function(a,b) { return a+b })/raw_values.temp.length)
      summary_stats.humidity.min = Math.round(Math.min(...raw_values.humidity))
      summary_stats.humidity.max = Math.round(Math.max(...raw_values.humidity))
      summary_stats.humidity.avg = Math.round(raw_values.humidity.reduce(function(a,b) { return a+b })/raw_values.humidity.length)
      summary_stats.sample_count = raw_values.pm25aqi.length
    }
    res.render('recentsamples', {title: 'Recent Samples for Device', sample_data: formatted_sample_data, device_info: device_info, d3_data: JSON.stringify(d3_data), current_data: JSON.stringify(most_recent_sample.dataValues),summary_stats: summary_stats});
  })
  .catch(err => {
    res.status(500).send({
      message: "Error formatting data: " + err
    });
  });
};

exports.device_update_post = function(req, res) {
  res.send('Not implemented: modify device')
};

exports.device_update_get = function(req, res) {
  res.send('Not implemented: modify device')
};

exports.device_create_post = function(req, res) {
  res.send('Not implemented: new device')
};

exports.device_create_get = function(req, res) {
  res.send('Not implemented: new device')
};

exports.device_list = function(req, res) {
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
            'temp':Math.round(record.dataValues.temp*9/5+32),
            'humidity':Math.round(record.dataValues.humidity),
            'last_sample_time':record.dataValues.measurement_time,
            'sample_age': formatTimeDiff(Math.abs(Date.now() - record.dataValues.measurement_time))
          }
          device_table_data.push(device_details)
        }
      )
      res.render('devices', {title: 'All Devices', devices:device_table_data})
    })
    .catch(err => {console.log(err)});
  }
);
};

exports.test_page = function(req, res) {
  res.render('test',{title: 'Test Page'})
}
