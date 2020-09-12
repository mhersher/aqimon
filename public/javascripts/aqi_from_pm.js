function aqiFromPM25(pm) {
  if (isNaN(pm)) return "-";
  if (pm == undefined) return "-";
  if (pm < 0) return pm;
  if (pm > 1000) return "-";
  if (pm>250.5) {
    return calcAQI(pm, 500, 301,500.4,250.5)
  } else if (pm>150.5) {
    return calcAQI(pm,300,201,250.4,150.5)
  } else if (pm>55.5) {
    return calcAQI(pm,200,151,150.4,55.5)
  } else if (pm>35.5) {
    return calcAQI(pm, 150,101,55.5,35.4)
  } else if (pm>12.1) {
    return calcAQI(pm, 100,51,35.4,12.1)
  } else if (pm>=0) {
    return calcAQI(pm, 50, 0 ,12, 0)
  }
}

function aqiFromPM10(pm) {
  if (isNaN(pm)) return "-";
  if (pm == undefined) return "-";
  if (pm < 0) return pm;
  if (pm > 1000) return "-";
  if (pm>426) {
    return calcAQI(pm, 500, 301,604,425)
  } else if (pm>356) {
    return calcAQI(pm,300,201,424,355)
  } else if (pm>256) {
    return calcAQI(pm,200,151,354,255)
  } else if (pm>156) {
    return calcAQI(pm, 150,101,254,155)
  } else if (pm>56) {
    return calcAQI(pm, 100,51,154,55)
  } else if (pm>=0) {
    return calcAQI(pm, 50, 0 ,54, 0)
  }
}

function epaPMCorrection(pm,rh,temp) {
  if (isNaN(pm)) return null;
  if (pm == undefined) return null;
  if (pm == 0) return null;
  corrected_pm = 0.541*pm-0.0618*rh +0.00534*temp +3.634
  return corrected_pm
}

function calcAQI(Cp, Ih, Il, BPh, BPl) {

  var a = (Ih - Il);
  var b = (BPh - BPl);
  var c = (Cp - BPl);
  return Math.round((a/b) * c + Il);

}

function colorFromAQI(aqi) {
  if (isNaN(aqi)) return "black";
  if (aqi == undefined) return "black";
  if (aqi == 0) {
    return "black";
  } else if (aqi <= 50) {
    return "green"
  } else if (aqi <= 100) {
    return "rgb(230,200,0)"
  } else if (aqi <= 150) {
    return "rgb(255,126,0)"
  } else if (aqi <= 200) {
    return "red"
  } else if (aqi <= 300) {
    return "rgb(143,63,151)"
  } else {
    return "rgb(126,0,35)"
  }
}


function getAQIDescription(aqi) {
  if (aqi >= 401) {
    return 'Hazardous';
  } else if (aqi >= 301) {
    return 'Hazardous';
  } else if (aqi >= 201) {
    return 'Very Unhealthy';
  } else if (aqi >= 151) {
    return 'Unhealthy';
  } else if (aqi >= 101) {
    return 'Unhealthy for Sensitive Groups';
  } else if (aqi >= 51) {
    return 'Moderate';
  } else if (aqi >= 0) {
    return 'Good';
  } else {
    return undefined;
  }
}

function getAQIMessage(aqi) {
  if (aqi >= 401) {
    return 'Health warning of emergency conditions: everyone is more likely to be affected.';
  } else if (aqi >= 301) {
    return 'Health warning of emergency conditions: everyone is more likely to be affected.';
  } else if (aqi >= 201) {
    return 'Health alert: The risk of health effects is increased for everyone.';
  } else if (aqi >= 151) {
    return 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.';
  } else if (aqi >= 101) {
    return 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.';
  } else if (aqi >= 51) {
    return 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.';
  } else if (aqi >= 0) {
    return 'Air quality is considered satisfactory, and air pollution poses little or no risk';
  } else {
    return undefined;
  }
}
