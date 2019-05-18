const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const nconf = require('nconf');
const fs = require('fs');

if (!fs.existsSync('./config.json')) {
    throw new Error('Missing config file. Make sure to create a config.json in the repo root. As an author for its contents.')
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
