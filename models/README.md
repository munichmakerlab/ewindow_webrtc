# MongoDB model schema
Define the database schema of users.

The **active** flag is **false** by default!

  ```javascript
    var mongoose = require('mongoose');

    var UserSchema = new mongoose.Schema({
      _id: mongoose.Schema.Types.ObjectId,
      name: {type: String},
      password: {type: String},
      ip: {type: String},
      token: {type: String},
      active: {type: Boolean, default: false},
      last_login: {type: Date, default: Date.now}
    });

    module.exports = mongoose.model('User', UserSchema);
  ```
