var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// User schema
var schema = Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    bcrypt: true,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    expires: 3600
  }
});

var TempUser = mongoose.model('TempUser', schema);

module.exports = TempUser;
