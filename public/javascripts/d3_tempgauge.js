let tempGauge = function(configuration) {
  let that = {}

  let config = {
    size: 200,
    arcInset: 150,
    arcWidth: 60,

    pointerWidth: 8,
    pointerOffset: 0,
    pointerHeadLengthPercent: 0.9,

    minValue: 50,
    maxValue: 90,

    minAngle: -130,
    maxAngle: 130,

    transitionMs: 750,

    currentLabelFontSize: 20,
    currentLabelInset: 20,
    labelFontSize: 15,
    labelFormat: (numberToFormat) => { return Math.round(numberToFormat)
    },

    arcColorFn: function(value) {
      let ticks = [{
        tick: 0,
        color: 'blue'
      }, {
        tick: 65,
        color: 'green'
      }, {
        tick: 75,
        color: 'orange'
      }, {
        tick: 80,
        color: 'red'
      }]
      let ret;
      ticks.forEach(function(tick) {

        if (value > tick.tick) {
          ret = tick.color
          return
        }
      });
      return ret;
    }
  }

  function configure(configuration) {
    for (let prop in configuration) {
      config[prop] = configuration[prop]
    }
  }
  configure(configuration);

  let foreground, arc, svg, current;
  let cur_color;
  let new_color, hold;

  var oR = config.size - config.arcInset;
  var iR = config.size - oR - config.arcWidth;

  function deg2rad(deg) {
    return deg * Math.PI / 180
  }

  function render(value) {

    //oR = 30;
    //iR = 10;



    // Arc Defaults
    arc = d3.arc()
      .innerRadius(iR)
      .outerRadius(oR)
      .startAngle(deg2rad(config.minAngle))

    // Place svg element
    svg = d3.select("#tempgauge").append("svg")
      .attr("width", config.size)
      .attr("height", config.size)
      .append("g")
      .attr("transform", "translate(" + config.size / 2 + "," + config.size / 2 + ")")


    // Append background arc to svg
    var background = svg.append("path")
      .datum({
        endAngle: deg2rad(config.maxAngle)
      })
      .attr("class", "gauge-background")
      .attr("d", arc)

    // Append foreground arc to svg
    foreground = svg.append("path")
      .datum({
        endAngle: deg2rad(config.maxAngle)
      })
      //.style("fill", cur_color)
      .attr("d", arc);

    // Display Current value
    current = svg.append("text")
      .attr("transform", "translate(0," + -(-config.currentLabelInset + iR / 4) + ")") // Push up from center 1/4 of innerRadius
      .attr("text-anchor", "middle")
      .style("font-size", config.currentLabelFontSize)
      .style("font-family", config.labelFont)
      .text(config.labelFormat(current))
  }

  function update(value) {
    // Get new color
    new_color = config.arcColorFn(value)
    var numPi = deg2rad(Math.floor((value-config.minValue)/(config.maxValue-config.minValue)*(config.maxAngle-config.minAngle)+config.minAngle))
    // Display Current value
    current.transition()
      .text(value)
      // .text(config.labelFormat(value))

    // Arc Transition
    foreground.transition()
      .duration(config.transitionMs)
      .styleTween("fill", function() {
        return d3.interpolate(new_color, cur_color);
      })
      .call(arcTween, numPi);

    // Set colors for next transition
    hold = cur_color;
    cur_color = new_color;
    new_color = hold;
  }

  // Update animation
  function arcTween(transition, newAngle) {
    transition.attrTween("d", function(d) {
      var interpolate = d3.interpolate(d.endAngle, newAngle);
      return function(t) {
        d.endAngle = interpolate(t);
        return arc(d);
      };
    });
  }

  render();
  that.update = update;
  that.configuration = config;
  return that;
}

let tempgauge = new tempGauge({
});
tempgauge.update(Math.round(current_data.temp*9/5+32))
