var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Category schema
var schema = Schema({
  title: {
    type: String,
    trim: true,
    required: true,
    unique: true
  },
  image: {
    type: String
  },
  description: {
    type: String,
    trim: true
  },
  keywords: {
    type: String,
    trim: true
  }
});

var Category = mongoose.model('Category', schema);

module.exports = Category;
