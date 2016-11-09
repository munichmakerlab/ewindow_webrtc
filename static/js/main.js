// https://stackoverflow.com/a/979995
var QueryString = function () {
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split('=');
        // If first entry with this name
    if (typeof query_string[pair[0]] === 'undefined') {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === 'string') {
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

var connectList = {};
var channelIsActive = {}; // tracks which channels are active


document.addEventListener('keydown', (event) => {
  const keyName = event.key;
  if (keyName === 'Control') {
    // not alert when only Control key is pressed.
    return;
  }
  if (keyName === 'a') {
    console.log(`Key pressed ${keyName}`);
  } else if (keyName === 'b') {
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
  		  console.log('more than one');
  	  }
    }
  }
}, false);


$(document).ready(function() {
  var token = localStorage.getItem('token');
  var username = localStorage.getItem('user');
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
  $('#selfVideo').toggleClass('blur-5', !pauseMode);
  var easyrtcid = localStorage.getItem('easyrtcid');
  var otherid = localStorage.getItem('otherid');
  if (easyrtc.getConnectStatus(otherid) === easyrtc.IS_CONNECTED) {
    easyrtc.sendDataP2P(otherid, 'blur', !pauseMode);
  } else {
    easyrtc.showError('NOT-CONNECTED', 'not connected to ' + easyrtc.idToName(otherid) + ' yet.');
  }
  pauseMode = !pauseMode;
});


$('#selfVideo').click(function() {
  $(this).toggleClass('reflection');
});


$('#admin').click(function(){
  var token = localStorage.getItem('token');
  var username = localStorage.getItem('user');
  if (username === 'eWindowMaster'){
    $.ajax({
      url: '/admin/',
      type: 'GET',
      headers: {'Authorization': 'Bearer ' + token},
      success: function(data) {
        location.assign('/admin');
      }
    });
  }
});


$('#logout').click(function(){
  console.log('logout');
  var token = localStorage.getItem('token');
  $.ajax({
    url: '/auth/logout',
    type: 'POST',
    data: {token: token},
    success: function(data) {
      localStorage.removeItem('token');
      var otherid = localStorage.getItem('otherid');
      easyrtc.hangup(otherid);
      $('#loginContainer').show(500);
      $('#logout').hide();
      $('#demoContainer').hide();
      location.reload(true);
    }
  });
});


$('#signin').click(function(){
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
        localStorage.setItem('user', data.user.name);
        localStorage.setItem('token', data.token);
        connect();
      }
    }
  });
});


function connect() {
  var user = localStorage.getItem('user');
  var token = localStorage.getItem('token');
  if (!user) {
    user = QueryString.name ? QueryString.name : 'guest';
  }
  easyrtc.setUsername(user);
  easyrtc.setCredential({'token': token});
  easyrtc.setVideoDims(640,480);
  easyrtc.enableDataChannels(true);
  easyrtc.setDataChannelOpenListener(openListener);
  easyrtc.setDataChannelCloseListener(closeListener);
  easyrtc.setPeerListener(addToConversation);
  easyrtc.setRoomOccupantListener(convertListToButtons);
  easyrtc.easyApp('easyrtc.audioVideoSimple', 'selfVideo', ['callerVideo'], loginSuccess, loginFailure);
}


function addToConversation(who, msgType, content) {
  console.log(easyrtc.idToName(who) + ' requested ' + msgType + ' - ' + content);
  if (msgType == 'blur') {
    $('#callerVideo').toggleClass('blur-50', content);
  }
}


function openListener(otherParty) {
  console.log('openListener: ' + otherParty);
  channelIsActive[otherParty] = true;
  localStorage.setItem('otherid', otherParty);
  updateButtonState(otherParty);
}


function closeListener(otherParty) {
  console.log('closeListener: ' + otherParty);
  channelIsActive[otherParty] = false;
  localStorage.removeItem('otherid');
  updateButtonState(otherParty);
}


function convertListToButtons (roomName, data, isPrimary) {
  connectList = data;
  // clear old list
  $('#otherClients').empty();
  // add all clients
  $.each(connectList, function(i, client) {
    var btn = $('<button/>', {
      text: client.username,
      type: 'button',
      id: client.easyrtcid,
      class: 'list-group-item',
      click: function(){
        performCall(client.easyrtcid);
      }
    });
    var lbl = $('<span/>', {
      class: 'label pull-right progress-bar-striped '
    }).appendTo(btn);
    btn.appendTo('#otherClients');
    updateButtonState(client.easyrtcid);
  });
}


function updateButtonState(otherEasyrtcid) {
  var isConnected = channelIsActive[otherEasyrtcid];
  var btn = $('#'+otherEasyrtcid);
  var lbl = btn.find('span');
  btn.toggleClass('list-group-item-warning', !isConnected);
  btn.toggleClass('list-group-item-success', isConnected);
  btn.toggleClass('progress-bar-striped', isConnected);
  lbl.toggleClass('label-success', isConnected);
  lbl.toggleClass('label-warning', !isConnected);
  lbl.text(isConnected ? 'in call' : 'idle');
}


function performCall(otherEasyrtcid) {
  easyrtc.hangupAll();
  if (easyrtc.getConnectStatus(otherEasyrtcid) === easyrtc.NOT_CONNECTED) {
    try {
      easyrtc.call(otherEasyrtcid,
        function(caller, media) { // success callback
          if (media === 'datachannel') {
            console.log('made call succesfully');
            connectList[otherEasyrtcid] = true;
          }
        },
        function(errorCode, errorText) {
          connectList[otherEasyrtcid] = false;
          easyrtc.showError(errorCode, errorText);
        },
        function(wasAccepted) {
          console.log('was accepted=' + wasAccepted);
        }
      );
    } catch (callerror) {
      console.log('saw call error ', callerror);
    }
  } else {
    easyrtc.showError('ALREADY-CONNECTED', 'already connected to ' + easyrtc.idToName(otherEasyrtcid));
  }
}


function loginSuccess(easyrtcid) {
  localStorage.setItem('easyrtcid', easyrtcid);
  $('#iam').html('I am ' + easyrtc.idToName(easyrtcid));
  $('#backdrop').html('Connected ... idle ...');
}


function loginFailure(errorCode, message) {
  easyrtc.showError(errorCode, message);
}
