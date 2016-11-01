var mongoose = require('mongoose');
var crypto = require('crypto');
var User = require('./models/User.js');
var jwt = require('jsonwebtoken');
var config = require('./config');

this.sha512 = function(password) {
  var hash = crypto.createHmac('sha512', config.secret);
  hash.update(password);
  var value = hash.digest('hex');
  return value;
};

this.checkAuth = function(token) {
  jwt.verify(token, config.secret, function(err, decoded) {
    if (err) {
      return {status: 401, err: err};
    } else {
      User.findOne({'token': token}, function(err, user) {
        if (err) {
          return {status: 401, err: 'Error occured: ' + err};
        } else {
          if (user) {
            return user;
          } else {
            return {status: 401, err: 'No User Authorization found'};
          }
        }
      });
    }
  });
  return token;
}

this.ensureAuthorized = function(req, res, next) {
  var bearerToken;
  if (req.headers && req.headers.authorization) {
    var bearer = req.headers.authorization.split(' ');
    if (bearer.length == 2) {
      var scheme = bearer[0];
      var credentials = bearer[1];
      if (/^Bearer$/i.test(scheme)) {
        bearerToken = credentials;
        req.token = bearerToken;
      }
    } else {
      res.status(401).json({err: 'Format is Authorization: Bearer [token]'});
    }
  } else if (req.param('token')) {
    bearerToken = req.param('token');
    delete req.query.token;
    req.token = bearerToken;
  } else {
    res.status(401).json({err: 'No Authorization header was found'});
  }
  if (req.token) {
    jwt.verify(req.token, config.secret, function(err, decoded) {
      if (err) {
        res.status(401).json({err: err});
      } else {
        User.findOne({'token': req.token}, function(err, user) {
          if (err) {
            res.status(401).json({err: 'Error occured: ' + err});
          } else {
            if (user) {
              req.user = user;
              next();
            } else {
              res.status(401).json({err: 'No User Authorization found'});
            }
          }
        });
      }
    });
  } else {
    res.status(401).json({err: 'No User Authorization found'});
  }
};

module.exports = this;
