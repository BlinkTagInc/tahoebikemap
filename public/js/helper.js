const config = require('../../frontendconfig.json');

exports.encode = (string) => encodeURIComponent(string).replace(/%20/g, '+');

exports.decode = (string) => decodeURIComponent(string.replace(/\+/g, '%20'));

function metersToMiles(meters) {
  return meters * 0.000621371;
}

function metersToFeet(meters) {
  return meters * 3.28084;
}

function hoursToMinutes(hours) {
  return hours * 60;
}

exports.formatDistance = (meters) => `${metersToMiles(meters).toFixed(1)} miles`;

exports.formatTime = (meters) => {
  const miles = metersToMiles(meters);
  const lowEstimate = miles / config.highBikeSpeedMph;
  const highEstimate = miles / config.lowBikeSpeedMph;

  let formattedTime;
  if (highEstimate < 1) {
    formattedTime = `${hoursToMinutes(lowEstimate).toFixed()} to ${hoursToMinutes(highEstimate).toFixed()} min`;
  } else {
    formattedTime = `${lowEstimate.toFixed(1)} to ${highEstimate.toFixed(1)} hours`;
  }

  return formattedTime;
};

exports.getElevationGain = (profile) => {
  let totalElevGain = 0;
  profile.forEach((p, idx) => {
    if (idx < profile.length - 1 && profile[idx][1] < profile[idx + 1][1]) {
      totalElevGain += profile[idx + 1][1] - profile[idx][1];
    }
  });

  return totalElevGain;
};

exports.formatElevation = (elevation) => `${metersToFeet(elevation).toFixed()} feet`;
