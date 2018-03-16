var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Post = require('../models/post');
var Comment = require('../models/comment');

// User schema
var schema = Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    bcrypt: true,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  }
});

var User = mongoose.model('User', schema);

module.exports = User;
