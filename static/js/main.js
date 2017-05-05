var selfEasyrtcid = "";

// https://stackoverflow.com/a/979995
var QueryString = function() {
    // This function is anonymous, is executed immediately and
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
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
        if (easyrtc.getConnectionCount() > 0) {
            easyrtc.hangupAll();
            setStatus("IDLE");
        } else {

            var len = 0;
            var easyrtcid;
            for (easyrtcid in window.otherOccupants) {
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

function connect() {
    easyrtc.setVideoDims(640, 480);
    easyrtc.setRoomOccupantListener(updateRoomOccupants);
    easyrtc.setUsername(QueryString.name ? QueryString.name : "guest");
    easyrtc.setCredential({
        "token": (QueryString.key ? QueryString.key : ""),
        "cluster": (QueryString.cluster ? QueryString.cluster : ""),
    });
    easyrtc.easyApp("easyrtc.audioVideoSimple", "selfVideo", ["callerVideo"], loginSuccess, loginFailure);
}


function clearConnectList() {
    var otherClientDiv = document.getElementById("otherClients");
    while (otherClientDiv.hasChildNodes()) {
        otherClientDiv.removeChild(otherClientDiv.lastChild);
    }
}

function updateRoomOccupants(roomName, data, isPrimary) {
    window.roomname = roomName;
    window.otherOccupants = data;
    updateOccupantsListDisplay();
}

function updateOccupantsListDisplay() {
    clearConnectList();
    var otherClientDiv = document.getElementById("otherClients");
    for (var easyrtcid in window.otherOccupants) {
        var button = document.createElement("li");
        button.onclick = function(easyrtcid) {
            return function() {
                performCall(easyrtcid);
            };
        }(easyrtcid);
        var txt = easyrtc.idToName(easyrtcid)
        /*if( easyrtc.getConnectStatus(easyrtcid) == easyrtc.NOT_CONNECTED ){
        	txt += " (idle)";
        } else {
        	txt += " (in call)";
        }*/
        try {
            txt += " (" + window.otherOccupants[easyrtcid].presence.status + ")";
        } catch (e) {
            txt += " (nostatus)";
        }
        var label = document.createTextNode(txt);
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
    selfEasyrtcid = easyrtcid;
    document.getElementById("iam").innerHTML = "I am " + easyrtc.idToName(easyrtcid);
    document.getElementById("backdrop").innerHTML = "Connected ... idle ..."
    setStatus("IDLE");
}

function setStatus(status) {
    easyrtc.updatePresence("chat", status);
}

function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, message);
}
