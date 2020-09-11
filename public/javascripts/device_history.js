//Fill current status block at top of page
update_device_status = function(json) {
var device_name = document.getElementById('device_name')
var pm25 = document.getElementById('pm25');
var pm10 = document.getElementById('pm10');
var temp = document.getElementById('temp');
var hum = document.getElementById('hum');
var pa_pm25 = document.getElementById('pa_pm25');
var pa_pm10 = document.getElementById('pa_pm10');
var pa_pres = document.getElementById('pa_pres');
var last_sample = document.getElementById('last_sample');
var alerts = document.getElementById('alerts')
device_name.innerHTML = json.name
pm25.innerHTML = json.pm25aqi
pm10.innerHTML = json.pm10aqi

if (units == 'C') {
  temp.innerHTML = json.temp+'\u00B0'+units
}
else {
  temp.innerHTML = Math.round(json.temp*9/5+32)+'\u00B0'+units
}
hum.innerHTML = json.humidity + '%'
if (epa_smoke_corrections == 1) {
  var pa_pm25_value=epaPMCorrection(json.pa_pm25raw, json.pa_humidity,json.pa_temp)
} else {
  var pa_pm25_value=json.pa_pm25raw
}
const pa_pm25aqi = aqiFromPM25(pa_pm25_value)
console.log(pa_pm25_value, pa_pm25aqi)
pa_pm25.innerHTML = pa_pm25aqi
pa_pm10.innerHTML = aqiFromPM10(json.pa_pm10raw)
pa_pres.innerHTML = Math.round(json.pa_pressure) + ' mbar'
last_sample.innerHTML = json.sample_age
//Indoor AQI Alerts
const indoor_aqi_message = getAQIMessage(json.pm25aqi)
const indoor_aqi_description = getAQIDescription(json.pm25aqi)
if (document.getElementById('indoorpmalert')) {
  console.log('indoorpmalertexists')
  document.getElementById('indoorpmalert').remove()
}
if (json.pm25aqi > 100) {
  alerts.innerHTML = '<div id="indoorpmalert" role="alert">Indoor air quality is <strong>'+indoor_aqi_description+'</strong>: '+indoor_aqi_message+'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>'
  var indoorpmalert = document.getElementById('indoorpmalert')
}
if (json.pm25aqi > 300) {
  indoorpmalert.className = 'alert alert-hazardous alert-dismissible fade show'
  pm25.className = 'text-hazardous'
}
else if (json.pm25aqi > 200) {
  indoorpmalert.className = 'alert alert-veryunhealthy alert-dismissible fade show'
  pm25.className = 'text-veryunhealthy'
}
else if (json.pm25aqi > 150) {
  indoorpmalert.className = 'alert alert-unhealthy alert-dismissible fade show'
  pm25.className = 'text-unhealthy'
}
else if (json.pm25aqi > 100) {
  indoorpmalert.className = 'alert alert-usg alert-dismissible fade show'
  pm25.className = 'text-usg'
}
else if (json.pm25aqi > 50) {
  pm25.className = 'text-moderate'
}
else {
  pm25.className = 'text-healthy'
}

//Outdoor AQI Alerts
const outdoor_aqi_message = getAQIMessage(pa_pm25aqi)
const outdoor_aqi_description = getAQIDescription(pa_pm25aqi)
if (document.getElementById('outdoorpmalert')) {
  console.log(document.getElementById('outdoorpmalert'))
  document.getElementById('outdoorpmalert').remove()
}
if (pa_pm25aqi > 100) {
  alerts.innerHTML += '<div id="outdoorpmalert" role="alert">Outdoor air quality is <strong>'+outdoor_aqi_description+'</strong>: '+outdoor_aqi_message+'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>'
  var outdoorpmalert = document.getElementById('outdoorpmalert')
}
if (pa_pm25aqi > 300) {
  outdoorpmalert.className = 'alert alert-hazardous alert-dismissible fade show'
  pa_pm25.className = 'text-hazardous'
}
else if (pa_pm25aqi > 200) {
  outdoorpmalert.className = 'alert alert-veryunhealthy alert-dismissible fade show'
  pa_pm25.className = 'text-veryunhealthy'
}
else if (pa_pm25aqi > 150) {
  outdoorpmalert.className = 'alert alert-unhealthy alert-dismissible fade show'
  pa_pm25.className = 'text-unhealthy'
}
else if (pa_pm25aqi > 100) {
  outdoorpmalert.className = 'alert alert-usg alert-dismissible fade show'
  pa_pm25.className = 'text-usg'
}
};


//Fill summary stats at bottom of page
update_sample_meta = function(json) {
  var pm25meta = document.getElementById('pm25meta')
  var pm10meta = document.getElementById('pm10meta')
  var tempmeta = document.getElementById('tempmeta')
  var hummeta = document.getElementById('hummeta')
  pm25meta.innerHTML = 'Average: ' + json.pm25aqi.avg + '<br /> Lowest: ' + json.pm25aqi.min + '<br /> Hightest: '+ json.pm25aqi.max
  pm10meta.innerHTML = 'Average: ' + json.pm10aqi.avg + '<br /> Lowest: ' + json.pm10aqi.min + '<br /> Hightest: '+ json.pm10aqi.max
  if (units == 'C') {
    tempmeta.innerHTML = 'Average: ' + json.temp.avg + '\u00B0C<br /> Lowest: ' + json.temp.min + '\u00B0C<br /> Hightest: '+ json.temp.max +'\u00B0C'
  }
  else {
    tempmeta.innerHTML = 'Average: ' + Math.round(json.temp.avg*9/5+32) + '\u00B0F<br /> Lowest: ' + Math.round(json.temp.min*9/5+32) + '\u00B0F<br /> Hightest: '+ Math.round(json.temp.max*9/5+32) + '\u00B0F'
  }

  hummeta.innerHTML = 'Average: ' + json.humidity.avg + '%<br /> Lowest: ' + json.humidity.min + '%<br /> Hightest: '+ json.humidity.max + "%"
};

//Fill charts in middle of page
update_charts = function(json) {
  d3_data = json
  document.getElementById('pmviz').innerHTML = ''
  draw_pm_chart(d3_data)
  document.getElementById('tempviz').innerHTML = ''
  draw_temp_chart(d3_data)
}

//Run main update to fetch new data.
update_page = function(new_device_id = device_id, new_range = range, new_units = units, new_epa_smoke_corrections = epa_smoke_corrections) {
  const previous_range = range
  const previous_device_id = device_id
  const previous_units = units
  const previous_epa_smoke_corrections = epa_smoke_corrections
  epa_smoke_corrections = new_epa_smoke_corrections
  device_id = new_device_id
  range = new_range
  units = new_units
  const device_details_request = new Request('/api/device/'+new_device_id, {method:'GET'});
  const sample_meta_request = new Request('/api/samples_meta/'+new_device_id+'/'+new_range, {method: 'GET'})
  const sample_history_request = new Request('/api/samples/'+new_device_id+'/'+ new_range, {method: 'GET'})
  fetch(sample_history_request)
  .then(response => {
    if (response.status === 200) {
    return response.json();
    } else {
      throw new Error('Error in API request');
    }
    })
    .then(response => {
      update_charts(response);
    })
    .catch(error => {
      console.error(error);
    });
  fetch(device_details_request)
  .then(response => {
    if (response.status === 200) {
    return response.json();
    } else {
      throw new Error('Error in API request');
    }
    })
    .then(response => {
      update_device_status(response);
    })
    .catch(error => {
      console.error(error);
    });
  fetch(sample_meta_request)
  .then(response => {
    if (response.status === 200) {
    return response.json();
    } else {
      throw new Error('Error in API request');
    }
    })
    .then(response => {
      update_sample_meta(response);
    })
    .catch(error => {
      console.error(error);
    });

    //Update button active state
    unit_c_button = document.getElementById('tempc')
    unit_f_button = document.getElementById('tempf')
    if (units == 'C') {
      unit_c_button.className = unit_c_button.className.replace(' active','')+ ' active'
      unit_f_button.className = unit_f_button.className.replace(' active','')
    }
    else {
      unit_f_button.className = unit_f_button.className.replace(' active','')+' active'
      unit_c_button.className = unit_c_button.className.replace(' active','')
    }
    previous_range_button = document.getElementById('range'+previous_range)
    previous_range_button.className = previous_range_button.className.replace(' active', '')
    new_range_button = document.getElementById('range'+new_range)
    new_range_button.className = new_range_button.className.replace(' active', '')+ ' active'
    smoke_on_button = document.getElementById('smoke_on')
    smoke_off_button = document.getElementById('smoke_off')
    if (epa_smoke_corrections == 1) {
      smoke_on_button.className = unit_c_button.className.replace(' active','')+ ' active'
      smoke_off_button.className = unit_f_button.className.replace(' active','')
    } else {
      smoke_off_button.className = unit_c_button.className.replace(' active','')+ ' active'
      smoke_on_button.className = unit_f_button.className.replace(' active','')
    }
    history.pushState(0,device_name,'/app/device/'+device_id+'/recent/'+range);
}

//Declare chart data globally to make it available to D3...should improve this.
var d3_data = {}
update_page();
setInterval(update_page, 300000);
