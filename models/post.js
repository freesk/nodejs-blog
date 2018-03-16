var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('../models/user');
var Category = require('../models/category');
var Comment = require('../models/comment');

// Post schema
var schema = Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  body: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  description : {
    type: String,
    trim: true
  },
  keywords: {
    type: String,
    trim: true
  }
});

var Post = mongoose.model('Post', schema);

module.exports = Post;
