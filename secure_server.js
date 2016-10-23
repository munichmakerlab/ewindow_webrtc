// Load required modules
var https   = require("https");     // https server core module
var fs      = require("fs");        // file system core module
var express = require("express");   // web framework external module
var io      = require("socket.io"); // web socket external module
var easyrtc = require("easyrtc");   // EasyRTC external module

// Setup and configure Express http server. Expect a subfolder called "static" to be the web root.
var httpApp = express();
httpApp.use(express.static(__dirname + "/static/"));

var onAuthenticate = function(socket, easyrtcid, appName, username, credential, easyrtcAuthMessage, next){
  console.log("Authenticating user " + username + " for application " + appName + " and token " + credential.token);
  if (appName == "adminSite" && username != "handsomeJack"){
    next(new easyrtc.util.ConnectionError("Failed our private auth."));
  }
  else {
    next(null);
  }
};

easyrtc.events.on("authenticate", onAuthenticate);

// Start Express https server on port 8443
var webServer = https.createServer(
{
    key:  fs.readFileSync("ewindow_key.pem"),
    cert: fs.readFileSync("ewindow_cert.pem")
},
httpApp).listen(8443);

// Start Socket.io so it attaches itself to Express server
var socketServer = io.listen(webServer, {"log level":2});

// Start EasyRTC server
var rtc = easyrtc.listen(httpApp, socketServer);
