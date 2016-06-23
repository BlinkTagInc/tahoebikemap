require('keen-js');

const config = require('../../frontendconfig.json');
const error = require('./error');

const client = new Keen({
  projectId: config.keenProjectId,
  writeKey: config.keenWriteKey,
});

exports.logQuery = (startAddress, endAddress, startLocation, endLocation) => {
  const queryEvent = {
    startAddress,
    endAddress,
    startLocation,
    endLocation,
    referrer: document.referrer,
    keen: {
      timestamp: new Date().toISOString()
    }
  };

  client.addEvent("queries", queryEvent, (err, res) => {
    if (err) {
      error.handleError(err);
    }
  });
};
