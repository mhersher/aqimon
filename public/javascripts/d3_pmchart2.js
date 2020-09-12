draw_pm_chart2 = function(data,selection) {
  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 10, bottom: 20, left: 30}
  const divwidth = parseInt(d3.select('#pmviz').style('width'), 10);
  var dims = {width: divwidth-margin.left-margin.right, height: 300-margin.top-margin.bottom};

  // append the svg object to the body of the page
  var svg = d3.select("#pmviz")
    .append("svg")
      .attr("width", dims.width + margin.left + margin.right)
      .attr("height", dims.height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // read data in, including datetime formatting
  const timeParse = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");
  var indoor_pm_25 = {id: 'Indoor PM2.5', values:[]}
  var indoor_pm_10 = {id: 'Indoor PM10', values:[]}
  var outdoor_pm_25 = {id: 'Outdoor PM2.5', values:[]}
  var outdoor_pm_10 = {id: 'Outdoor PM10', values:[]}
  var indoor_temp = {id: 'Indoor', values:[]}
  var indoor_hum = {id: 'Indoor Humidity %', values:[]}
  var outdoor_temp = {id: 'Outdoor', values:[]}
  var outdoor_hum = {id: 'Outdoor Humidity %', values:[]}
  if (units == 'F') {
    outdoor_temp.id += ' \u00B0F'
    indoor_temp.id += ' \u00B0F'
  } else {
    outdoor_temp.id += ' \u00B0C'
    indoor_temp.id += ' \u00B0C'
  }
  data.forEach(function (sample) {
    measurement_time = timeParse(sample.measurement_time)
    indoor_pm_25.values.push({
      'measurement_time': measurement_time,
      'value': aqiFromPM25(sample.pm25raw)})
    indoor_pm_10.values.push({
      'measurement_time': measurement_time,
      'value': aqiFromPM10(sample.pm10raw)})
    outdoor_pm_10.values.push({
      'measurement_time': measurement_time,
      'value': aqiFromPM10(sample.pa_pm10raw)})
    if (epa_smoke_corrections == 1) {
      var outdoor_pm25raw = epaPMCorrection(sample.pa_pm25raw,sample.pa_humidity,sample.pa_pressure)
    } else {
      var outdoor_pm25raw = sample.pa_pm25raw
    }
    outdoor_pm_25.values.push({
      'measurement_time':measurement_time,
      'value':aqiFromPM25(outdoor_pm25raw)
    })
    if (units == 'F') {
      var indoor_temp_sample = sample.temp*9/5+32
      var outdoor_temp_sample = sample.pa_temp*9/5+32
    } else {
      var indoor_temp_sample = sample.temp
      var outdoor_temp_sample = sample.pa_temp
    }
    indoor_temp.values.push({
      'measurement_time': measurement_time,
      'value': indoor_temp_sample})
    indoor_hum.values.push({
      'measurement_time': measurement_time,
      'value': sample.humidity})
    outdoor_temp.values.push({
      'measurement_time': measurement_time,
      'value': outdoor_temp_sample})
    outdoor_hum.values.push({
      'measurement_time':measurement_time,
      'value': sample.pa_humidity
    });
  });
  if (selection == 'PM2.5') {
    var nested_data = [indoor_pm_25, outdoor_pm_25];
  } else if (selection == 'PM10') {
    var nested_data = [indoor_pm_10, outdoor_pm_10];
  } else if (selection == 'Temp') {
    var nested_data = [indoor_temp, outdoor_temp];
  } else if (selection == 'Hum') {
    var nested_data = [indoor_hum, outdoor_hum];
  }



  // x axis
  var x = d3.scaleTime()
    .domain(d3.extent(data, function(d) { return timeParse(d.measurement_time); }))
    .range([ 0, dims.width ]);
  svg.append("g")
    .attr("transform", "translate(0," + dims.height + ")")
    .call(d3.axisBottom(x).ticks(5));
  // Add Y axis

  const max_value = d3.max(nested_data.map(ids => {
    id_max = d3.max(ids.values.map(sample => {
      return sample.value
    }))
    return id_max;

  }))
  var y = d3.scaleLinear()
    .domain([0, max_value+10])
    .range([ dims.height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // color palette
  var res = nested_data.map(function(d){ return d.id }) // list of group names
  var color = d3.scaleOrdinal()
    .domain(res)
    .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])

  // gradient encoding
  var aqigradient = svg.append("linearGradient")
    .attr("id", 'aqigradient')
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", dims.height)
  .selectAll("stop")
    .data([
      {offset: y(300) / dims.height, color: "rgb(126,0,35)"},
      {offset: y(200) / dims.height, color: "rgb(143,63,151)"},
      {offset: y(150) / dims.height, color: "red"},
      {offset: y(100) / dims.height, color: "rgb(255,126,0)"},
      {offset: y(50) / dims.height, color: "yellow"},
      {offset: y(0) / dims.height, color: "green"}

    ])
  .join("stop")
    .attr("offset", d => (d.offset))
    .attr("stop-color", d => d.color);

  //Function to determine if a line is graphing AQI.  If so, fill with gradient, if not according to color key.
  const linefill = function(d) {
    if (d.id.search('PM') != -1) {
      return "url(#aqigradient)"
    } else {
      return color(d.id)
    }
  }
  // Draw the line
  svg.selectAll(".line")
      .data(nested_data)
      .enter()
      .append("path")
        .attr("fill", "none")
        //.attr("stroke", function(d){ return color(d.id) })
        //.attr("stroke","url(#aqigradient)")
        .attr("stroke", function(d) { return linefill(d)})
        .attr("stroke-width", 2)
        .attr("d", function(d){
          return d3.line()
            .defined(function (d) { return d.value !== '-'; })
            .x(function(d) { return x(d.measurement_time); })
            .y(function(d) { return y(+d.value); })
            (d.values)
        })

  // Label lines
  svg.selectAll(".text")
      .data(nested_data)
      .enter()
      .append("text")
        .attr("fill", function(d) {
          return linefill(d);
        })
        .text(function(d) {
          return d.id
        })
        .attr("transform", function(d) {
          const translate = "translate(" + (x(d.values[d.values.length-1].measurement_time) + 10) + "," + (y(d.values[d.values.length-1].value)-10) + ")"
          return translate;
        })
}

update_pm_chart = function(data,selection) {
  document.getElementById('pmviz').innerHTML = ''
  if (selection != chart_selection) {
    chart_selection = selection
    draw_pm_chart2(data,selection)
  }
}
