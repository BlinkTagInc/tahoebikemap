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
    ip_address: '${keen.ip}',
    user_agent: '${keen.user_agent}',
    keen: {
      timestamp: new Date().toISOString()
    }
  };

  client.addEvent("queries", queryEvent, (err, res) => {
    if (err) {
      console.error(err);
    }
  });
};
