draw_pm_chart = function(data) {
const width = 500;
const height = 200;
const margin = 5;
const padding = 5;
const adj = 30;
// we are appending SVG first
const svg = d3.select("#pmviz").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "-"
          + adj + " -"
          + adj + " "
          + (width + adj *3) + " "
          + (height + adj*3))
    .style("padding", padding)
    .style("margin", margin)
    .classed("svg-content", true);

//-----------------------------DATA-----------------------------//
const timeConv = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ");
const dataset = data
//const dataset = linechart.reverse().forEach(element => element['measurement_time']=timeConv(element['measurement_time']))
dataset.columns = ['measurement_time','PM2.5 AQI','PM10 AQI'];
    var slices = data.columns.slice(1).map(function(id) {
        return {
            id: id,
            values: data.map(function(d){
                return {
                    date: timeConv(d.measurement_time),
                    measurement: +d[id]
                };
            })
        };
    });
//----------------------------SCALES----------------------------//
const xScale = d3.scaleTime().range([0,width]);
const yScale = d3.scaleLinear().rangeRound([height, 0]);
xScale.domain(d3.extent(data, function(d){
    return timeConv(d.measurement_time)}));
yScale.domain([(0), d3.max(slices, function(c) {
    return d3.max(c.values, function(d) {
        return d.measurement + 4; });
        })
    ]);

//-----------------------------Mouseover Callout----------------//
var //tooltip = { width: 100, height: 100, x: 10, y: -30 },
    bisectDate = d3.bisector(function(d) { return d.date; }).left,
    dateFormatter = d3.timeFormat("%m/%d/%y");

var focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("circle")
        .attr("class","line0")
        .attr("r", 5);

    focus.append("rect")
        .attr("class", "tooltip")
        .attr("width", 165)
        .attr("height", 70)
        .attr("x", 10)
        .attr("y", -22)
        .attr("rx", 4)
        .attr("ry", 4);

    focus.append("text")
        .attr("class", "tooltip-date")
        .attr("x", 18)
        .attr("y", -2);

    focus.append("text")
        .attr("x", 18)
        .attr("y", 18)
        .attr("style", "fill: #ed3700")
        .text("PM2.5 AQI:");

    focus.append("text")
        .attr("x", 18)
        .attr("y", 38)
        .attr("style", "fill: #2b2929")
        .text("PM10 AQI:");

    focus.append("text")
        .attr("class", "tooltip-pm25")
        .attr("x", 100)
        .attr("y", 18);

    focus.append("text")
          .attr("class", "tooltip-pm10")
          .attr("x", 100)
          .attr("y", 38);

//-----------------------------AXES-----------------------------//
const yaxis = d3.axisLeft()
    .scale(yScale);

const xaxis = d3.axisBottom()
    .scale(xScale);


//----------------------------LINES-----------------------------//
const line = d3.line()
    .x(function(d) { return xScale(d.date); })
    .y(function(d) { return yScale(d.measurement); });

let id = 0;
const ids = function () {
    return "line-"+id++;
}
//-------------------------2. DRAWING---------------------------//
//-----------------------------AXES-----------------------------//
svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xaxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");;

svg.append("g")
    .attr("class", "axis")
    .call(yaxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("dy", ".75em")
    .attr("y", 6)
    .style("text-anchor", "end")
    .text("AQI");

//----------------------------LINES-----------------------------//
const lines = svg.selectAll("lines")
    .data(slices)
    .enter()
    .append("g");

    lines.append("path")
    .attr("class", ids)
    .attr("d", function(d) {return line(d.values); });

    lines.append("text")
    .attr("class","serie_label")
    .datum(function(d) {
        return {
            id: d.id,
            value: d.values[d.values.length - 1]}; })
    .attr("transform", function(d) {
            return "translate(" + (xScale(d.value.date) + 10)
            + "," + (yScale(d.value.measurement) + 5 ) + ")"; })
    .attr("x", 5)
    .text(function(d) { return d.id; });


//--------------------------Callout------------------------------//
svg.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .on("mouseover", function() { focus.style("display", null); })
    .on("mouseout", function() { focus.style("display", "none"); })
    .on("mousemove", mousemove_pm);
function mousemove_pm() {
            var x0 = xScale.invert(d3.mouse(this)[0]),
                i = bisectDate(slices[0].values, x0,1),
                d0 = data[i - 1],
                d1 = data[i],
                d = x0 - d0.measurement_time > d1.measurement_time - x0 ? d1 : d0;
            //console.log(x0,i)
            focus.attr("transform", "translate(" + xScale(timeConv(d.measurement_time)) + "," + yScale(d['PM2.5 AQI']) + ")");
            focus.select(".tooltip-date").text(timeConv(d.measurement_time).toLocaleString());
            focus.select(".tooltip-pm25").text(d['PM2.5 AQI']);
            focus.select(".tooltip-pm10").text(d['PM10 AQI'])
          }

};

draw_pm_chart(d3_data)
