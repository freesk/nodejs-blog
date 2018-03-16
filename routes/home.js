var express = require('express');
var router = express.Router();
var Post = require('../models/post.js');

// home page
router.get('/', function(req, res, next) {
  Post.find({})
    // show the newest
    .sort({date: -1})
    .limit(3)
    .populate({
      path: 'author',
      select: 'username -_id'
    })
    .populate({
      path: 'category',
      select: 'title -_id'
    })
    .exec(function(err, posts){
      if (err) return console.log(err.message);
      res.render('home', {
        "title": 'Home',
        "posts": posts
      });
    });
});

module.exports = router;
