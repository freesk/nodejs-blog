var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You have logged out');
  res.redirect('/users/login');
});

module.exports = router;
