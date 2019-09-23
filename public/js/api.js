const config = require('../../frontendconfig.json');

exports.getRoute = (startLocation, endLocation, scenario) => {
  const parameters = `/?lat1=${startLocation.lat}&lng1=${startLocation.lng}&lat2=${endLocation.lat}&lng2=${endLocation.lng}&scenario=${scenario}`;
  return fetch(`${config.bikeMapperApiUrl}${parameters}`)
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      console.error('Unsuccessful response from getRoute: ', response.statusText);
      return Promise.reject(response);
    }
  })
  .catch(err => console.error(err));
};
