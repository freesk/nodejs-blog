var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('../models/user');

// Groups schema
var schema = Schema({
  admins: [{
    type: Schema.Types.ObjectId,
    required: true,
    unique: true
  }],
  publishers: [{
    type: Schema.Types.ObjectId,
    required: true,
    unique: true
  }],
  users: [{
    type: Schema.Types.ObjectId,
    required: true,
    unique: true
  }]
});

var Admin = mongoose.model('Admin', schema);

module.exports = Admin;
