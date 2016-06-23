const nconf = require('nconf');
const fetch = require('node-fetch');

exports.index = (req, res, next) => {
  res.render('index');
};

exports.feedback = (req, res, next) => {
  console.log(req.body);

  res.render('thankyou');
}
