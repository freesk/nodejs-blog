var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user.js');
var TempUser = require('../models/temp_user.js');
var nodemailer = require("nodemailer");
var createToken = require('../misc/createToken.js');
var smtpTransport = require('nodemailer-smtp-transport');

// create a reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport(
  smtpTransport('smtps://<your_account_name>:<your_password>@smtp.yandex.ru')
);

router.get('/', function(req, res) {
  res.render('register', { 'title': 'Register' });
});

router.post('/', function(req, res) {

  const origin = req.protocol + '://' + req.get('host');
  const confirmationUrl = origin + "/users/register/email-confirmation/";

  // fet form values
  var name      = req.body.name;
  var email     = req.body.email;
  var username  = req.body.username;
  var password  = req.body.password;
  var password2 = req.body.password2;

  // form validation
  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('email', 'Email field is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username field is required').notEmpty();
  req.checkBody('password', 'Password field is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  // check for errors
  var errors = req.validationErrors();

  if(errors)
    return res.render('register', {
      "formName": name,
      "formEmail": email,
      "formUsername": username,
      "formPassword": password,
      "formPassword2": password2,
      "user": req.user,
      "errors": errors
    });

  var token = createToken();

  var tempUser = new TempUser({
    name: name,
    email: email,
    username: username,
    password: password,
    createdAt: new Date(),
    token: token
  });

  bcrypt.hash(tempUser.password, null, null, function(err, hash) {
    if(err) return console.log(err.message);
    // set hashed pw
    tempUser.password = hash;

    User.findOne({'username': tempUser.username}, function(err, user) {
      if(err) return console.log(err.message);

      if(user) {
        req.flash('error', 'Sorry, username "' + tempUser.username + '" is already taken');
        res.redirect('/users/register');
        return;
      }

      User.findOne({'email': tempUser.email}, function(err, user) {
        if(err) return console.log(err.message);

        if(user) {
          req.flash('error', 'Sorry, email "' + tempUser.email + '" is already taken');
          res.redirect('/users/register');
          return;
        }

        tempUser.save(function(err, tempUser) {
          // setup e-mail data
          var mailOptions = {
            // sender address
            from: '"My Blog" <nodejsblog2016@yandex.ru>',
            // list of receivers
            to: email,
            subject: 'Email confirmation',
            // subject line
            text: 'Hello, ' + tempUser.username + '! Please confirm your email to complete registration. ' + confirmationUrl + token, // plaintext body
            html: 'Hello, ' + tempUser.username + '! Please confirm your email to complete registration. <a href="' + confirmationUrl + token + '">Confirm</a>' // html body
          };
          // send it off with the defined transport object
          transporter.sendMail(mailOptions, function(error, info){
            if(error) return console.log(error.message);
            console.log('Message sent: ' + info.response);
            req.flash('success', 'Check your mail for a confirmation link');
            res.redirect('/users/login');
          });
        });

      });

    });

  });

});

router.get('/email-confirmation/:token', function(req, res) {

  TempUser.findOne({ token:req.params.token }, function(err, tempUser){
    if(err) return console.log(err.message);

    if(!tempUser) {
      req.flash('error', 'Registration token is outdated or invalid');
      res.redirect('/users/login');
      return;
    }

    // remove temp user
    tempUser.remove(function(err) {
      if(err) return console.log(err.message);
    });

    // create permanent user
    var user = new User({
      name: tempUser.name,
      email: tempUser.email,
      username: tempUser.username,
      password: tempUser.password,
      messages: []
    });

    // save
    user.save(function(err, user) {
      if(err) console.log(err.message);
      req.flash('success', 'You are now registered and may log in');
      res.redirect('/users/login');
    });

  });

});

module.exports = router;
