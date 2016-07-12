const nconf = require('nconf');
const mailHelper = require('sendgrid').mail;
const _ = require('underscore');

exports.index = (req, res, next) => {
  res.render('index');
};

exports.feedback = (req, res, next) => {
  console.log(req.body);

  if (!req.body) {
    next(new Error('No body sent'));
  }

  const text = _.reduce(req.body, (memo, value, key) => {
    if (value) {
      memo.push(`${key}: ${value}\n\n`);
    }

    return memo;
  }, []).join('');

  const from_email = new mailHelper.Email("noreply@tahoebike.org");
  const to_email = new mailHelper.Email("brendan+tahoe@blinktag.com");
  const subject = "Feedback from Lake Tahoe Bike Mapper";
  const content = new mailHelper.Content("text/plain", text);
  const mail = new mailHelper.Mail(from_email, subject, to_email, content);

  const sg = require('sendgrid').SendGrid(nconf.get('SENDGRID_API_KEY'));
  const requestBody = mail.toJSON();
  const request = sg.emptyRequest();
  request.method = 'POST';
  request.path = '/v3/mail/send';
  request.body = requestBody;
  sg.API(request, (response) => {
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
    res.render('thankyou', {
      redirectUrl: req.body.redirectUrl,
    });
  });
}
