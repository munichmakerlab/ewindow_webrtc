var express   = require('express');
var router    = express.Router();
var jwt       = require('jsonwebtoken');
var mongoose  = require('mongoose');
var User      = require('../models/User.js');
var Auth      = require('../auth.js');
var config    = require('../config');
var ip        = require('ip');

/* GET /auth/setup/ */
router.get('/setup', function(req, res) {
  User.findOne({'name': 'eWindowMaster'}, function(err, user) {
    if (err) {
      return res.status(404).json({err: 'Error occured: ' + err});
    } else {
      if (user) {
        return res.status(404).json({err: 'Admin user already exists!'});
      } else {
        // create a sample admin user
        var hashPassword = Auth.sha512(config.secret);
        var adminUser = new User();
        adminUser._id = mongoose.Types.ObjectId();
        adminUser.name = 'eWindowMaster';
        adminUser.active = true;
        adminUser.ip = ip.address();
        adminUser.password = hashPassword;
        adminUser.save(function(err, user) {
          user.token = jwt.sign({name: user.name}, config.secret, {expiresIn: '10 years'});
          user.save(function(err, userNew) {
            return res.json({user: userNew, token: userNew.token});
          });
        });
      }
    } // if (err) else
  });
});

/* POST /auth/authenticate/ */
router.post('/authenticate', function (req, res) {
  var username = '';
  var password = '';
  username = req.body.name.toLowerCase();
  password = req.body.password;
  if (username && password) {
    var regexUsername = new RegExp(["^", username, "$"].join(""), "i");
    var hashPassword = Auth.sha512(password);
    User.findOne({'name': regexUsername, 'password': hashPassword, 'active': true}, function(err, user) {
      if (err) {
        return res.status(400).json({err: 'Error occured: ' + err});
      } else {
        if (user) {
          user.last_login = new Date();
          user.token = jwt.sign({name: user.name}, config.secret, {expiresIn: '10 years'});
          user.save(function(err, userUpdate) {
            console.log(userUpdate);
            return res.json({user: userUpdate, token: userUpdate.token});
          });
        } else {
          return res.status(401).json({err: 'Wrong user or password or deactive'});
        }
      }
    });
  } else {
    return res.status(400).json({err: 'No username or password supplied'});
  }
});

/* POST /auth/signin/ */
router.post('/signin/', function(req, res) {
  if (req.body.password !== req.body.confirmPassword) {
    return res.status(401).json({err: 'Password doesn\'t match'});
  }
  var hashPassword = Auth.sha512(req.body.password);
  User.findOne({'name': req.body.name}, function(err, user) {
    if (err) {
      return res.status(401).json({err: 'Error occured: ' + err});
    } else {
      if (user) {
        return res.status(401).json({err: 'User already exists!'});
      } else {
        var newUser = new User();
        newUser._id = mongoose.Types.ObjectId();
        newUser.name = req.body.name;
        newUser.active = false;
        newUser.ip = ip.address();
        newUser.save(function(err, user) {
          user.token = jwt.sign({name: user.name}, config.secret, {expiresIn: '10 years'});
          user.save(function(err, userNew) {
            return res.json({user: userNew, token: userNew.token});
          });
        });
      }
    }
  });
});

/* POST /auth/logout/ */
router.post('/logout/', function(req, res) {
  if (!req.body.token) {
    return res.json({err: 'No token found'});
  }
  User.findOne({'token': req.body.token}, function(err, user) {
    if (err) {
      return res.json({err: 'Error occured: ' + err});
    } else {
      if (user) {
        user.token = "";
        user.save(function(err, userUpdate) {
          console.log(userUpdate);
          return res.status(200).json({status: 'Logout User "' + userUpdate.name + '" successful.'});
        });
      } else {
        return res.json({err: 'No User Authorization found'});
      }
    }
  });
});


module.exports = router;
