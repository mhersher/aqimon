const initialize_profile = function() {
  const subscriptions_request = new Request('/api/subscription', {method: 'get'})
  fetch(subscriptions_request)
  .then(response => {
    if (response.status === 200) {
    return response.json();
    } else {
      throw new Error('Error in API request');
    }
    })
    .then(response => {
      var json = response
      subscriptions_table(response);

    })
    .catch(error => {
      console.error(error);
    });
    get_profile()
    .then(data => {update_profile_form(data);})
    .catch(error => {
      console.error(error);
    });
}

const subscriptions_table = function(json) {
  var table = document.getElementById('subscriptions_table');
  json.forEach((subscription) => {
    var row = table.insertRow(-1);
    var name = row.insertCell(0)
    name.innerHTML = '<a href=device/'+subscription.device.id+'>'+subscription.device.name+'</a>'
    var metric = row.insertCell(1)
    metric.innerHTML = subscription.metric.toUpperCase()
    var increasing = row.insertCell(2)
    increasing.innerHTML = subscription.increasing
    var threshold = row.insertCell(3)
    threshold.innerHTML = subscription.threshold
    var decreasing = row.insertCell(4)
    decreasing.innerHTML = subscription.decreasing
    var cancel = row.insertCell(5)
    cancel.innerHTML = '<button type="button" class="btn btn-secondary" onclick="cancel_subscription('+subscription.id+', '+row.rowIndex+')">Cancel</button>'
  });
}

const update_profile_form = function(json) {
  var first_name = document.getElementById('first_name');
  first_name.placeholder = json.first_name;
  var last_name = document.getElementById('last_name');
  last_name.placeholder = json.last_name;
  var country_code = document.getElementById('country');
  country_code.placeholder = json.phone_country_code;
  var phone = document.getElementById('phone');
  phone.placeholder = json.phone_phone_number;
  var units = document.getElementById('units');
  units.placeholder = json.units;
}
