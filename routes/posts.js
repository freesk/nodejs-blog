var express = require('express');
var router = express.Router();
var Post = require('../models/post.js');
var User = require('../models/user.js');
var Category = require('../models/category.js');
var Comment = require('../models/comment.js');
var multipart = require('connect-multiparty')();
var checkUserAccess = require('../misc/checkUserAccess');
var path = require('path');
var imageHost = require('../misc/imageHost');

router.get('/add', ensureAuthenticated, function(req, res, next) {
  Category.find({}, function(err, categories) {
    res.render('addpost', {
      "title": 'Add Post',
      "action": '/blog/posts/add',
      "categories": categories
    });
  });
});

router.post('/add', ensureAuthenticated, multipart, function(req, res, next){
  validateTheForm(req, function(errors, data) {
    if(errors) {
      Category.find({}, function(err, categories) {
        res.render('addpost', {
          "action": '/blog/posts/add',
          "title": 'Add Post',
          "categories": categories,
          "formTitle": data.title,
          "formBody": data.body,
          "formCategory": data.category,
          "formDescription": data.description,
          "formKeywords": data.keywords,
          "user": req.user,
          "errors": errors
        });
      });
      return;
    }

    // get user data
    User.findById(req.user._id, function(err, user) {
      if(err) return console.log(err.message);
      Category.findOne({ "title": data.category }, function(err, category) {
        if(err)
          return console.log(err.message);

        function submitThePost(image) {
          var newPost = new Post({
            "title": data.title,
            "body": data.body,
            "category": category._id,
            "description": data.description,
            "keywords": data.keywords,
            "date": data.date,
            "author": user._id,
            "image": image
          });

          // create post
          newPost.save(function(err, post) {
            if(err)
              return console.log(err.message);
            req.flash('success', 'Post Submitted');
            res.redirect('/blog');
          });
        }

        const imageObj = req.files.mainimage;

        if (imageObj.size > 0)
          return imageHost.upload(imageObj.path, function(err, imageUrl) {
            if (err) return console.log(err.message);
            submitThePost(imageUrl);
          });

        submitThePost();

      });

    });

  });

});

router.get('/show/:id', function(req, res, next){
  Post.findById(req.params.id)
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username -_id'
        }
      })
      .populate({
        path: 'author',
        select: 'username -_id'
      })
      .populate({
        path: 'category',
        select: 'title -_id'
      })
      .exec(function(err, post){
        if (err) return console.log(err.message);
        res.locals.meta = {
          "description": post.description,
          "keywords": post.keywords
        }
        res.render('show', {
          "post": post
        });
      });
});

router.get('/edit/:id', ensureAuthenticated, function(req, res, next) {
  Category.find({}, function(err, categories) {
    if(err) return console.log(err.message);
    Post.findById(req.params.id)
        .populate({
          path: 'category',
          select: 'title -_id'
        })
        .exec(function(err, post) {
          if(err) return console.log(err.message);
          res.render('addpost', {
            "action": '/blog/posts/edit/' + req.params.id,
            "title": 'Edit Post',
            "categories": categories,
            // Pass existing values into the form
            "formTitle": post.title,
            "formDescription": post.description,
            "formKeywords": post.keywords,
            "formBody": post.body,
            "formCategory": post.category.title,
          });

    });
  });
});

router.post('/edit/:id', multipart, ensureAuthenticated, function(req, res, next) {

  checkUserAccess(req, Post, req.params.id, function(err, doc) {
    if (err) {
      req.flash('error', err.message);
      res.redirect('/blog/');
    } else {
      validateTheForm(req, function(errors, data) {
        if(errors) {
          Category.find({}, function(err, categories) {
            if(err)
              return console.log(err.message);
            Category.findById(doc.category, function(err, category) {
              if(err)
                return console.log(err.message);
              res.render('addpost', {
                "action": '/blog/posts/add/' + req.params.id,
                "title": 'Edit Post',
                "categories": categories,
                "formTitle": doc.title,
                "formBody": doc.body,
                "formDescription": doc.description,
                "formKeywords": doc.keywords,
                "formCategory": category.title,
                "user": req.user,
                "errors": errors
              });
            });
          });
          return;
        }

        Category.findOne({"title": data.category}, function(err, category) {
          if(err) return console.log(err.message);
          var newData = {
            "title": data.title,
            "body": data.body,
            "description": data.description,
            "keywords": data.keywords,
            "category": category._id,
            "date": data.date
          };
          function submitEditedPost() {
            Post.update({ _id: doc._id }, { $set: newData }, function(err) {
              if(err) return console.log(err.message);
              req.flash('success', 'Post Updated');
              res.redirect('/blog');
            });
          }

          const imgObject = req.files.mainimage;

          // check if image exists
          if(imgObject.size > 0) {
            const imgId = path.parse(doc.image).name;
            // delete the current image
            imageHost.delete(imgId, function(err) {
              if(err) return console.log('Oops, an error occured');
            });
            // upload a new one
            imageHost.upload(imgObject.path, function(err, imageUrl) {
              if(err) console.log(err.message);
              // updated new data object
              newData.image = imageUrl;
              submitEditedPost();
            });
          } else {
            submitEditedPost();
          }

        });

      });

    }

  });

});

router.get('/delete/:id', ensureAuthenticated, function(req, res, next) {
  checkUserAccess(req, Post, req.params.id, function(err, doc) {
    if (err) {
      req.flash('error', err.message);
      res.redirect('/blog/');
    } else {
      // remove related image
      if(doc.image) {
        const imgId = path.parse(doc.image).name;
        imageHost.delete(imgId, function(err) {
          if(err) return console.log(err.message);
        });
      }
      // remove record from the db
      doc.remove(function(err) {
        if(err) return console.log(err.message);
        req.flash('success', 'The post has been removed');
        res.redirect('/blog');
      });
    }
  });
});

// delete comment
router.get('/:postid/comments/delete/:commentid', ensureAuthenticated, function(req, res, next) {
  checkUserAccess(req, Comment, req.params.commentid, function(err, doc) {
    if (err) {
      req.flash('error', err.message);
      res.redirect('/blog/');
    } else {
      Post.update({ _id: req.params.postid }, { $pullAll: { "comments" : [ req.params.commentid ] } }, function(err, response) {
        if(err) return console.log(err.message);
        req.flash('success', 'Comment has been deleted');
        res.redirect('/blog/posts/show/' + req.params.postid);
      });
    }
  });
});

router.post('/comments/add', ensureAuthenticated, function(req, res, next){

  var body        = req.body.body;
  var postid      = req.body.postid;
  var commentDate = new Date();

  req.checkBody('body', 'Body field is required').notEmpty();

  // check for errors
  var errors = req.validationErrors();

  if(errors) {
    Post.findById(postid)
        .populate({
          path: 'comments',
          populate: {
            path: 'author',
            select: 'username -_id'
          }
        })
        .populate({
          path: 'author',
          select: 'username -_id'
        })
        .populate({
          path: 'category',
          select: 'title -_id'
        })
        .exec(function(err, post){
          if (err) return console.log(err.message);
          res.render('show', {
            "post": post,
            "user": req.user,
            "errors": errors
          });
        });

    return;
  }

  var newComment = new Comment({
    "author": req.user._id,
    "body": body,
    "date": commentDate
  });

  newComment.save(function(err, comment) {
    if(err) console.log(err.message);
    Post.update({ _id: postid }, { $push: { "comments": comment._id } },
      function(err, doc) {
        if(err) return console.log(err.message);
      }
    );
  });

  req.flash('success', 'Comment added');
  res.redirect('/blog/posts/show/'+postid);

});

function validateTheForm(req, callback) {
  var data = {};

  data.title       = req.body.title;
  data.category    = req.body.category;
  data.body        = req.body.body;
  data.description = req.body.description;
  data.keywords    = req.body.keywords;
  data.date        = new Date();
  data.image       = "";

  req.checkBody('title', 'Title filed is required').notEmpty();
  req.checkBody('body', 'Body field is required').notEmpty();
  req.checkBody('category', 'Category field is required').notEmpty();

  callback(req.validationErrors(), data);
}

// redirect to login page if the user is not authenticated
function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) return next();
  res.redirect('/users/login');
}

module.exports = router;
