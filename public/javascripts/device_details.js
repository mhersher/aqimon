update_lifetime_stats = function(device_id) {
  console.log('updating lifetime stats')
}

update_period_stats = function(device_id, range) {
  console.log('updating period stats')
}


update_current_conditions = function(device_id) {
  //Set up the API query
  const device_details_request = new Request('/api/latest_sample/'+device_id, {method:'GET'});
  fetch(device_details_request)
  .then(response => {
    if (response.status === 200) {
    return response.json();
    } else {
      throw new Error('Error in API request');
    }
    })
    .then(response => {
      write_page_current_conditions(response);
    })
    .catch(error => {
      console.error(error);
    });
}

write_page_current_conditions = function(json) {
  console.log('updating current conditions')
  //Set up the page
  //var current_conditions_div = document.getElementById('current_conditions')
  //console.log(json)
  //const conditions_string = 'Current Conditions: <strong>PM2.5:</strong> 56 In139 Out, <strong>PM10:</strong> 20 In/100 Out, Temp: 75 In/90 Out, Humidity 34% In/60% Out'
  //current_conditions_div.innerHTML = conditions_string

}

update_device_info = function(device_id) {
  console.log('updating device details')
}

update_device_info(device_id)
update_period_stats(device_id,'10080')
update_current_conditions(device_id)
update_device_info(device_id)
