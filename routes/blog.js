var express = require('express');
var router = express.Router();
var Post = require('../models/post.js');

router.get('/', function(req, res, next) {

  Post.find({})
      // show the newest
      .sort({date: -1})
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
        res.render('blog', {
          "title": 'Blog',
          "posts": posts
        });
      })
});

module.exports = router;
