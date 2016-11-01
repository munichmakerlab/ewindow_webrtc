// https://stackoverflow.com/a/979995
var QueryString = function () {
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
  return query_string;
}();
// ----

document.addEventListener('keydown', (event) => {
  const keyName = event.key;

  if (keyName === 'Control') {
    // not alert when only Control key is pressed.
    return;
  }

  if (keyName === "a") {
    console.log(`Key pressed ${keyName}`);
  } else if (keyName === "b") {
    if ( easyrtc.getConnectionCount() > 0 ) {
      easyrtc.hangupAll();
  } else {

	  var len = 0;
	  var easyrtcid;
	  for(easyrtcid in window.otherOccupants) {
		  len++;
	  }
	  if (len == 1) {
	  	performCall(easyrtcid);
	  } else {
		  console.log("more than one");
	  }
  }
  }
}, false);


$(document).ready(function() {
  var token = localStorage.getItem("token");
  var username = localStorage.getItem("user");
  if (token) {
    $('#loginForm').hide();
    $('#logout').show(500);
    $('#demoContainer').show(500);
    if (username === 'eWindowMaster'){
      $('#admin').show(500);
    }
    connect();
  } else {
    $('#loginForm').show(500);
    $('#logout').hide();
    $('#demoContainer').hide();
    $('#admin').hide();
  }
});


$("#admin").click(function(){
  var token = localStorage.getItem("token");
  var username = localStorage.getItem("user");
  if (username === 'eWindowMaster'){
    $.ajax({
      url: '/admin/',
      type: 'GET',
      headers: {"Authorization": "Bearer " + token},
      success: function(data) {
        location.assign("/admin");
      }
    });
  }
});


$("#logout").click(function(){
  var token = localStorage.getItem("token");
  $.ajax({
    url: '/auth/logout',
    type: 'POST',
    data: {token: token},
    success: function(data) {
      if (data.status) {
        localStorage.removeItem("token");
        var easyrtcid = localStorage.getItem("easyrtcid");
        easyrtc.hangup(easyrtcid);
        $('#loginForm').show(500);
        $('#logout').hide();
        $('#demoContainer').hide();
        location.reload(true);
      }
    }
  });
});


$('#loginForm button').click(function(){
  console.log('login');
  var username = $('#inputUser').val();
  var password = $('#inputPassword').val();
  $.ajax({
    url: '/auth/authenticate',
    type: 'POST',
    data: {name: username, password: password},
    success: function(data) {
      if (data.token) {
        $('#loginForm').hide();
        $('#logout').show(500);
        $('#demoContainer').show(500);
        localStorage.setItem("user", data.user.name);
        localStorage.setItem("token", data.token);
        connect();
      }
    }
  });
});


function connect() {
  var user = localStorage.getItem("user");
  var token = localStorage.getItem("token");
  easyrtc.setVideoDims(640,480);
  easyrtc.setRoomOccupantListener(convertListToButtons);
  if (!user) {
    user = QueryString.name ? QueryString.name : "guest";
  }
  easyrtc.setUsername(user);
  easyrtc.setCredential({"token": token});
  easyrtc.easyApp("easyrtc.audioVideoSimple", "selfVideo", ["callerVideo"], loginSuccess, loginFailure);
}


function clearConnectList() {
  var otherClientDiv = document.getElementById("otherClients");
  while (otherClientDiv.hasChildNodes()) {
    otherClientDiv.removeChild(otherClientDiv.lastChild);
  }
}


function convertListToButtons (roomName, data, isPrimary) {
  clearConnectList();
  var otherClientDiv = document.getElementById("otherClients");
  window.otherOccupants = data;
  for(var easyrtcid in data) {
    var button = document.createElement("button");
    button.onclick = function(easyrtcid) {
      return function() {
        performCall(easyrtcid);
      };
    }(easyrtcid);

    var label = document.createTextNode(easyrtc.idToName(easyrtcid));
    button.appendChild(label);
    otherClientDiv.appendChild(button);
  }
}


function performCall(otherEasyrtcid) {
  easyrtc.hangupAll();

  var successCB = function() {};
  var failureCB = function() {};
  easyrtc.call(otherEasyrtcid, successCB, failureCB);
}


function loginSuccess(easyrtcid) {
  localStorage.setItem("easyrtcid", easyrtcid);
  document.getElementById("iam").innerHTML = "I am " + easyrtc.idToName(easyrtcid);
  easyrtc.updatePresence("chat", "idle");
}


function loginFailure(errorCode, message) {
  easyrtc.showError(errorCode, message);
}
