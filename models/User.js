var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {type: String},
  password: {type: String},
  token: {type: String},
  active: {type: Boolean, default: false},
  last_login: {type: Date, default: Date.now}
});

module.exports = mongoose.model('User', UserSchema);
