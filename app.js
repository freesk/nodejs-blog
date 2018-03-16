var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var passport = require('passport');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var mongoose = require('mongoose');
var express = require('express');
var home = require('./routes/home');
var users = require('./routes/users');
var login = require('./routes/login');
var register = require('./routes/register');
var blog = require('./routes/blog');
var posts = require('./routes/posts');
var categories = require('./routes/categories');
var striptags = require('striptags');

var app = express();

var mongoose = require('mongoose');
var express = require('express');

const mongodbUri = 'mongodb://localhost:27017/nodejs-blog';

var options = {
  server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } }
};

mongoose.connect(mongodbUri, options);

var conn = mongoose.connection;

conn.on('error', console.error.bind(console, 'connection error:'));

// Use locals for global variables
app.locals.moment = require('moment');

// set meta info object
app.locals.meta = {};

// set default meta info object
app.locals.metaDefault = {
  description: 'This is Dmitry\'s blog about everything',
  keywords: 'Whatever, you, like, to, have, as, a, keywords'
};

app.locals.truncateText = function(html, length) {
  const text = striptags(html);
  const truncatedText = text.substring(0, length);
  return truncatedText + "...";
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// handle express sessions
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

// passport
app.use(passport.initialize());
app.use(passport.session());

// validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.');
      var root      = namespace.shift();
      var formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// save the user
app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

app.use('/', home);
app.use('/users', users);
app.use('/users/login', login);
app.use('/users/register', register);
app.use('/blog', blog);
app.use('/blog/posts', posts);
app.use('/blog/categories', categories);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
