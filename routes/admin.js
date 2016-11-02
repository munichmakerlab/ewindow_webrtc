var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var User = require('../models/User.js');
var Auth = require('../auth.js');
var config = require('../config');

/* GET /admin/ */
router.get('/', function(req, res) {
  res.sendfile('./static/admin.html');
});

/* GET /admin/user show all user. */
router.get('/user/', Auth.ensureAuthorized, function(req, res, next) {
  User.find(function(err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* GET /admin/user/:id show one user */
router.get('/user/:id', Auth.ensureAuthorized, function(req, res, next) {
  if (!req.params.id) {
    return res.json({err: 'No user ID assigned'});
  }
  User.findOne({'_id': req.params.id}, function (err, post) {
    if (err) {
      res.json({err: 'Error occured: ' + err});
      return next(err);
    }
    res.json(post);
  });
});

/* POST /admin/user/ create new user */
router.post('/user/', Auth.ensureAuthorized, function(req, res, next) {
  if (!req.body.name || !req.body.password) {
    return res.json({err: 'username and password required'});
  }
  User.findOne({'name': req.body.name}, function(err, user) {
    if (err) {
      res.json({err: 'Error occured: ' + err});
    } else {
      if (user) {
        res.json({err: 'User already exists!'});
      } else {
        var hashPassword = Auth.sha512(req.body.password);
        var newUser = new User();
        newUser._id = mongoose.Types.ObjectId();
        newUser.name = req.body.name;
        newUser.password = hashPassword;
        newUser.active = req.body.active;
        newUser.ip = req.body.ip;
        newUser.save(function(err, user) {
          user.token = jwt.sign({name: user.name}, config.secret, {expiresIn: '10 years'});
          user.save(function(err, userNew) {
            var post = userNew;
            delete post.password;
            res.json({user: post, token: userNew.token});
          });
        });
      }
    }
  });
});

/* PUT /admin/user/:id update user */
router.put('/user/:id', Auth.ensureAuthorized, function(req, res, next) {
  if (!req.params.id) {
    return res.json({err: 'No user ID assigned'});
  }
  var id = req.params.id;
  var update = req.body;
  delete update._id
  if (update.password) {
    update.password = Auth.sha512(update.password);
  } else {
    delete update.password;
  }
  User.findByIdAndUpdate(id, update, function (err, post) {
    if (err) {
      res.json({err: 'Error occured: ' + err});
      return next(err);
    }
    var user = post;
    delete user.password;
    res.json(user);
  });
});

/* DELETE /admin/user/:id */
router.delete('/user/:id', Auth.ensureAuthorized, function(req, res, next) {
  if (!req.params.id) {
    return res.json({err: 'No user ID assigned'});
  }
  User.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) {
      res.json({err: 'Error occured: ' + err});
      return next(err);
    }
    res.json(post);
  });
});

module.exports = router;
