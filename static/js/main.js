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
    $('#loginContainer').hide();
    $('#logout').show(500);
    $('#demoContainer').show(500);
    if (username === 'eWindowMaster'){
      $('#admin').show(500);
    }
    connect();
  } else {
    $('#loginContainer').show(500);
    $('#logout').hide();
    $('#demoContainer').hide();
    $('#admin').hide();
  }
});

var pauseMode = false;
$('#pause').click(function(){
  $(this).find('span').toggleClass('glyphicon-pause', pauseMode);
  $(this).find('span').toggleClass('glyphicon-play', !pauseMode);
  // uncomment to test effect
  //$('#selfVideo').toggleClass('blurred', !pauseMode);
  $('#callerVideo').toggleClass('blurred', !pauseMode);
  pauseMode = !pauseMode;
});


$('#selfVideo').click(function() {
  $(this).toggleClass('reflection');
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
        $('#loginContainer').show(500);
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
        $('#loginContainer').hide();
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
  // remove all children of #otherClients
  $('#otherClients').empty();
}


function convertListToButtons (roomName, data, isPrimary) {
  clearConnectList();
  // add all clients
  $.each(data, function(i, easyrtcid) {
    var btnText = easyrtc.idToName(easyrtcid);
    var btnClass = '';
    var lblText = '';
    var lblClass = 'label-default';
  	if (easyrtc.getConnectStatus(easyrtcid) == easyrtc.NOT_CONNECTED) {
  		lblText   = 'idle';
      lblClass  = 'label-warning';
      btnClass  = 'list-group-item-warning';
  	} else {
  		lblText   = 'in call';
      lblClass  = 'label-success';
      btnClass  = 'list-group-item-success progress-bar-striped';
  	}
    var btn = $('<button/>',{
        text: btnText,
        type: 'button',
        class: 'list-group-item ' + btnClass,
        click: function(){
          performCall(easyrtcid);
        }
    });
    var lbl = $('<span/>',{
      text: lblText,
      class: 'label pull-right progress-bar-striped ' + lblClass
    }).appendTo(btn);
    btn.appendTo('#otherClients');
  });
}


function performCall(otherEasyrtcid) {
  easyrtc.hangupAll();
  var successCB = function() {};
  var failureCB = function() {};
  easyrtc.call(otherEasyrtcid, successCB, failureCB);
}


function loginSuccess(easyrtcid) {
  localStorage.setItem("easyrtcid", easyrtcid);
  $('#iam').html('I am ' + easyrtc.idToName(easyrtcid));
  $('#backdrop').html('Connected ... idle ...');
}


function loginFailure(errorCode, message) {
  easyrtc.showError(errorCode, message);
}
