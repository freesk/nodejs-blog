var express = require('express');
var router = express.Router();
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Category = require('../models/category.js');
var multipart = require('connect-multiparty')();
var path = require('path');
var imageHost = require('../misc/imageHost');

router.get('/', function(req, res, next) {
  Category.find({}, function(err, categories) {
    res.render('categories', {
      'title': "Categories",
      'categories': categories
    });
  });
});

router.get('/add', ensureAuthenticated, function(req, res, next) {
  res.render('addcategory', {
    'action': "/blog/categories/add",
    'title': "Add Category",
  });
});

router.get('/delete/:title', ensureAuthenticated, function(req, res, next) {
  Category.findOne({"title": req.params.title}, function(err, category) {
    category.remove(function(err, response){
      if(err) return console.log(err.message);

      // if the category has an image, remove it
      if(category.image) {
        const imgId = path.parse(category.image).name;
        imageHost.delete(imgId, function(err) {
          if(err) return console.log(err.message);
        });
      }

      // find posts with deleted category and set category to default
      function setDefaultCategory(defaultCat) {
        Post.update({category: category}, { $set: { category: defaultCat } }, function(err, response){
          if(err) console.log(err.message);
          req.flash('success', 'Category Deleted');
          res.redirect('/blog/categories');
        });
      }

      // find default category in the db
      Category.findOne({title: 'Default'}, function(err, defaultCat) {
        if(err) return console.log(err.message);
        // if not found, create default category
        if(!defaultCat) {
          var defaultNew = new Category({
            "title": "Default"
          });
          defaultNew.save(function(err, response) {
            if(err) return console.log(err.message);
            setDefaultCategory(defaultNew);
          });
        } else {
          setDefaultCategory(defaultCat);
        }
      });

    });
  });
});

router.get('/edit/:title', ensureAuthenticated, function(req, res, next) {
  Category.findOne({"title": req.params.title}, function(err, category){
    res.render('addcategory', {
      'title': "Edit Category",
      "action": "/blog/categories/edit/" + req.params.title,
      "formTitle": category.title,
      "formDescription": category.description,
      "formKeywords": category.keywords,
    });
  });
});

router.post('/edit/:title', ensureAuthenticated, multipart, function(req, res, next) {
  validateTheForm(req, function(errors, data) {
    if(errors) {
      res.render('addcategory', {
        "title": 'Edit Category',
        "action": "/blog/categories/edit/" + req.params.title,
        // passing back in case these are filled
        "formTitle": data.title,
        "formDescription": data.description,
        "formKeywords": data.keywords,
        // jade doesn't get user object via render
        "user": req.user,
        "errors": errors
      });
      return;
    }

    var newData = {
      "title": data.title,
      "description": data.description,
      "keywords": data.keywords
    };

    function updateTheCategory() {
      Category.update({ title: req.params.title }, { $set: newData }, function(err) {
        if(err) return console.log(err.message);
        req.flash('success', 'Category Updated');
        // redirect to /blog
        res.redirect('/blog/categories');
      });
    }

    const imageObj = req.files.mainimage;
    // check if image exists
    if(imageObj.size > 0) {
      imageHost.upload(imageObj.path, function(err, imageUrl) {
        if (err) console.log(err.message);
        newData.image = imageUrl;
        updateTheCategory();
      });
      Category.find({"title": req.params.title}, function(err, category){
        if(err) console.log(err.message);

        const imgId = path.parse(category.image).name;

        imageHost.delete(imgId, function(err) {
          if (err) console.log(err.message);
        });

      });
      return;
    }

    updateTheCategory();

  });
});

function validateTheForm(req, callback) {
  var data = {};

  data.title       = req.body.title;
  data.description = req.body.description;
  data.keywords    = req.body.keywords;
  data.image       = "";

  req.checkBody('title', 'Title filed is required').notEmpty();

  callback(req.validationErrors(), data);
}

router.post('/add', ensureAuthenticated, multipart, function(req, res, next){

  validateTheForm(req, function(errors, data) {
    if(errors) {
      res.render('addcategory', {
        "title": 'Add Category',
        'action': "/blog/categories/add",
        // passing back in case these are filled
        "formTitle": title,
        "formDescription": description,
        "formKeywords": keywords,
        // jade doesn't get user object via render
        "user": req.user,
        "errors": errors
      });
      return;
    }

    function submitTheCategory(image) {
      var newCategory = new Category({
        "title": data.title,
        "description": data.description,
        "keywords": data.keywords,
        "image": image
      });
      // create post
      newCategory.save(function(err, category) {
        if(err) console.log(err.message);
        req.flash('success', 'Category Submitted');
        res.redirect('/blog/categories');
      });
    }

    const imgObject = req.files.mainimage;

    // check if image exists
    if(imgObject.size > 0) {
      imageHost.upload(imgObject.path, function(err, imageUrl) {
        if (err) return console.log(err.message);
        submitTheCategory(imageUrl);
      });
      return;
    }

    submitTheCategory();

  });
});

router.get('/show/:title', function(req, res, next){
  Post.find({})
      .populate({
        path: 'category',
        select: 'title -_id',
        match: { title: req.params.title } // Set to null if doesn't match to req.params.title
      })
      .sort({date: -1}) // show the newest
      .exec(function(err, posts){
        if (err) return console.log(err.message);
        posts = posts.filter(function(post) {
          return post.category; // return only posts with title matching :id
        });
        res.render('blog', {
          "title": req.params.title,
          "posts": posts
        });
      });
});

// redirect to login page if the user is not authenticated
function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) return next();
  res.redirect('/users/login');
}

module.exports = router;
