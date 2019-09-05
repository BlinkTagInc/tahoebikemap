import KeenTracking from 'keen-tracking';

const config = require('../../frontendconfig.json');
const error = require('./error');

const LOG_ERRORS = false;

const client = new KeenTracking({
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

  client.recordEvent("queries", queryEvent, (err, res) => {
    if (LOG_ERRORS && err) {
      console.error("Analytics error: ", err);
    }
  });
};
