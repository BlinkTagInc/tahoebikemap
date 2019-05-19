const nconf = require('nconf');
const _ = require('underscore');
const request = require('request');
const SendGrid = require('@sendgrid/mail');

SendGrid.setApiKey(nconf.get('SENDGRID_API_KEY'));

exports.index = (req, res, next) => {
  res.render('index');
};

exports.terms = (req, res, next) => {
  res.render('terms');
};

exports.api = (req, res, next) => {
  console.log(req.method, req.url, ' (request received...)');
  var url = nconf.get('BIKE_MAPPER_API_URL') + req.url.replace('/api', '');
  req.pipe(request(url)).pipe(res);
};

exports.feedback = (req, res, next) => {
  if (!req.body) {
    next(new Error('No body sent'));
  }

  const text = _.reduce(req.body, (memo, value, key) => {
    if (value) {
      memo.push(`${key}: ${value}\n\n`);
    }

    return memo;
  }, []).join('');

  console.log('Email Content: ', text);

  const msg = {
    to: 'nick@speal.ca',
    from: 'noreply@tahoebike.org',
    subject: 'Feedback from Lake Tahoe Bike Map',
    text,
  }

  SendGrid.send(msg);

  res.render('thankyou', {
    redirectUrl: req.body.redirectUrl,
  });
};
