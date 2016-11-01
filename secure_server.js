// Load required modules
var config      = require('./config');      // secrete word & common settings
var https       = require("https");         // https server core module
var http        = require("http");          // https server core module
var fs          = require("fs");            // file system core module
var express     = require("express");       // web framework external module
var bodyParser  = require('body-parser');   // body parsing middleware
var io          = require("socket.io");     // web socket external module
var easyrtc     = require("easyrtc");       // EasyRTC external module
var jwt         = require('jsonwebtoken');  // json based token authorization
var mongoose    = require('mongoose');      // mongodb controller
var route_auth  = require('./routes/auth'); // route to login and register users
var Auth        = require('./auth.js');     // service to authenticate by token

// connect local mongodb database
mongoose.connect('mongodb://localhost/eWindow', function (err) {
  if (err) {
    console.log('connection error', err);
  } else {
    console.log('connection successful');
  }
});

// Setup and configure Express http server. Expect a subfolder called "static" to be the web root.
var httpApp = express();
httpApp.set('superSecret', config.secret);
httpApp.use(express.static(__dirname + "/static/"));
httpApp.use(bodyParser.json());
httpApp.use(bodyParser.urlencoded({ extended: true }));
httpApp.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// use routes for REST API
httpApp.use('/auth', route_auth);

var onAuthenticate = function(socket, easyrtcid, appName, username, credential, easyrtcAuthMessage, next) {
  console.log(`Authenticating user "${username}" for application "${appName}" and token "${credential.token}"`);
  if (credential.token) {
    var response = Auth.checkAuth(credential.token);
    if (!response || response.err) {
      next(new easyrtc.util.ConnectionError(response.err));
    } else {
      next(null);
    }
  } else {
    next(new easyrtc.util.ConnectionError("Failed our private auth."));
  }
};

easyrtc.events.on("authenticate", onAuthenticate);

var webServer;
if (process.argv.length == 3 && process.argv[2] == "dev") {
	console.log("Starting development server with TLS on port 8443");
	webServer = https.createServer(
		{
			key:  fs.readFileSync("ewindow_key.pem"),
			cert: fs.readFileSync("ewindow_cert.pem")
		}, httpApp).listen(8443);
} else {
	console.log("Starting server without TLS on port 8080");
	webServer = http.createServer(httpApp).listen(8080);

}

// Start Socket.io so it attaches itself to Express server
var socketServer = io.listen(webServer, {"log level":2});

// Start EasyRTC server
var rtc = easyrtc.listen(httpApp, socketServer);
