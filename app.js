const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const nconf = require('nconf');
const fs = require('fs');

if (!fs.existsSync('./config.json')) {
    console.error('\n\n--\nERROR: Missing config file.\nIf running in development, Make sure to create a config.json in the repo root. Ask an author for its contents.\nIn production, config variables are specified via the Heroku web interface.\n\n')
}

nconf
  .argv()
  .env()
  .file({file: './config.json'});

const app = express();

const routes = require('./routes');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', routes.index);

app.get('/terms', routes.terms);

app.get('/api', routes.api);

app.post('/api/feedback', routes.feedback);

// error handlers
require('./libs/errors')(app);

module.exports = app;
