const nconf = require('nconf');
const mailHelper = require('sendgrid').mail;
const _ = require('underscore');
const request = require('request');

exports.index = (req, res, next) => {
  res.render('index');
};

exports.terms = (req, res, next) => {
  res.render('terms');
};

exports.api = (req, res, next) => {
  console.log(req.url)
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

  console.log(text);

  const fromEmail = new mailHelper.Email('noreply@tahoebike.org');
  const toEmail = new mailHelper.Email('info@tahoebike.org');
  const subject = 'Feedback from Lake Tahoe Bike Map';
  const content = new mailHelper.Content('text/plain', text);
  const mail = new mailHelper.Mail(fromEmail, subject, toEmail, content);

  const sg = require('sendgrid').SendGrid(nconf.get('SENDGRID_API_KEY'));
  const requestBody = mail.toJSON();
  const request = sg.emptyRequest();
  request.method = 'POST';
  request.path = '/v3/mail/send';
  request.body = requestBody;
  sg.API(request, (response) => {
    res.render('thankyou', {
      redirectUrl: req.body.redirectUrl,
    });
  });
};
