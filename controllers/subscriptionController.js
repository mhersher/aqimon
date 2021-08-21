//var Sample = require('../models/device');
var db = require("../models");
var Sample = db.samples;
var User = db.users;
var Subscription = db.subscriptions;
var Notification = db.notifications;
var Op = db.Sequelize.Op;
var Sequelize = db.Sequelize;


function get_subscriptions(sample) = {
  //Get list of subscriptions that alert applies to
  Subscription.findAll({
    where: {
      device_id: sample.device_id
    }
  })
  .then(data => {
    //Check each subscription to see if the threshold has been met
    var triggered_subscriptions = []
    data.forEach(subscription) {
      if (check_thresholds(sample,subscription)==true) {
        trigger_subscriptions += subscription
      }
    }
    //Return the list of subscriptions triggered by this alert
    return triggered_subscriptions
  })
  .catch(err => {
    console.log(err);
  })
}

function check_thresholds(sample,subscription) = {
  //Get previous sample
  Sample.findOne({
    where: {
      device_id:sample.device_id,
      measurement_time: {
        [Op.lt]:sample.measurement_time
      }
    },
    order: [['measurement_time','DESC']]
  })
  .then(data => {
    const value = sample[subscription.metric]
    const previous_value = previous_sample[subscription.metric]
    const threshold = subscription.threshold
    const change = value - previous_value
    var triggered = false;
    if (change>0 AND subscription.increasing = true AND value > threshold) {
      triggered = true
    }
    if (change<0 AND subscription.decreasing = true) {
      triggered = true
    }
    return triggered, change
  })
  .catch(err => {
    console.log('Error checking thresholds: ',err)
  })



}

function check_suppressions(subscription) = {
  //For subscription a subscription that's in "alert" check to see if it has already alerted in the last hour at that Level

  //Return true (send notification) or false (suppress notification)
}

function send_notification(sample_id, subscriptions) = {

}
  //Fire the alert


function notify(sample_id) = {
  subscriptions = get_subscriptions(sample)
  var send_alert = false
  subscriptions.forEach(subscription) {
    if (check_suppressions(subscription) == true)
      send_alert = true
  }
  if (send_alert == true) {
    send_notification(sample_id, subscriptions)
  }
}
