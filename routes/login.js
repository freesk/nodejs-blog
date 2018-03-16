var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user.js');

passport.serializeUser(function(user, callback){
  callback(null, user.id);
});

passport.deserializeUser(function(id, callback){
  User.findById(id, function(err, user) {
    callback(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, callback) {
    User.findOne({ username: username }, function(err, user) {
      if(err)
        return console.log(err.message);
      if(!user)
        return callback(null, false, {message: 'Unknown user'});

      bcrypt.compare(password, user.password, function(err, isMatch) {
        if(err)
          return console.log(err.message);
        if(isMatch)
          return callback(null, user);

        return callback(null, false, {message: 'Invalid password'});
      });
    });
  }
));

router.get('/', function(req, res) {
  res.render('login', { 'title': 'Login' });
});

router.post('/',
  passport.authenticate('local', {
    failureRedirect:'/users/login',
    failureFlash:'Invalid username or password'
  }),
  function(req, res){
    console.log('Authentication successful');
    req.flash('success', 'You are good to go');
    res.redirect('/');
  }
);

module.exports = router;
