var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('../models/user');

// Comment schema
var schema = Schema({
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
  }
});

var Comment = mongoose.model('Comment', schema);

module.exports = Comment;
