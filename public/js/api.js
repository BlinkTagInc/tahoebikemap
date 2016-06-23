const config = require('../../frontendconfig.json');

exports.getRoute = (startLocation, endLocation) => {
  const parameters = `/?lat1=${startLocation.lat}&lng1=${startLocation.lng}&lat2=${endLocation.lat}&lng2=${endLocation.lng}`;
  return fetch(`${config.bikeMapperApiUrl}${parameters}`)
  .then((response) => response.json());
}
