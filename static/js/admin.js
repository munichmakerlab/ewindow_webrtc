// on body load
$(document).ready(function() {
  var token = localStorage.getItem("token");
  var username = localStorage.getItem("user");
  if (token && username === 'eWindowMaster') {
    loadUsers();
  } else {
    location.assign("../");
  }
});

// helper function to fill "template" by json object values
function renderTemplate(template, data) {
  var content = $('#'+template).html();
  $.each(data, function(key,val){
    var searchStr = '{{' + key + '}}';
    content = content.replace(new RegExp(searchStr,'g'), val);
  });
  return content;
}

// load all users and display in table
function loadUsers() {
  var token = localStorage.getItem("token");
  $.ajax({
    url: '/admin/user',
    type: 'GET',
    headers: {"Authorization": "Bearer " + token},
    success: function(data) {
      data.forEach(function(user) {
        var userStr = JSON.stringify(user);
        user.obj = btoa(userStr);
        user.active_class = user.active ? 'success' : 'danger';
        user.active = user.active ? 'active' : 'deactive';
        user.ip = user.ip ? user.ip : 'Not defined';
        var template = renderTemplate('hidden-template', user);
        $("#userlist").append(template);
      });
    }
  });
}

// on open edit user modal dialog
$('#dlgEditUser').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget);
  var user_obj = button.data('user-obj');
  localStorage.setItem("user_obj", user_obj);
  var user_obj_str = atob(user_obj);
  var user = JSON.parse(user_obj_str);
  var modal = $(this);
  // prefill dialog by stored user data from base64 encoded value "user-obj"
  modal.find('.modal-title').text('Edit User ' + user.name);
  modal.find('#inputUserEdit').val(user.name);
  modal.find('#inputIPEdit').val(user.ip);
  modal.find('#inputActiveEdit').prop('checked', user.active);
});

// save user and close edit user dialog
$('#btnEditUserSave').click(function(){
  $('#dlgEditUser').modal('hide');
  var token = localStorage.getItem("token");
  var user_obj_str = atob(localStorage.getItem("user_obj"));
  localStorage.removeItem("user_obj");
  var user = JSON.parse(user_obj_str);
  var username = $('#inputUserEdit').val();
  var active = $('#inputActiveEdit').prop('checked');
  var password = $('#inputPasswordEdit').val();
  var ip = $('#inputIPEdit').val();
  user.name = username;
  user.active = active;
  user.ip = ip;
  if (password != '') {
    user.password = password;
  } else {
    delete user.password;
  }
  $.ajax({
    url: '/admin/user/' + user._id,
    type: 'PUT',
    data: user,
    headers: {"Authorization": "Bearer " + token},
    success: function(data) {
      // reload page after response from backend
      location.reload(true);
    }
  });
});

// save new user and close new user dialog
$('#btnNewUserSave').click(function(){
  $('#dlgAddUser').modal('hide');
  var token = localStorage.getItem("token");
  var username = $('#inputUserAdd').val();
  var active = $('#inputActiveAdd').prop('checked');
  var password = $('#inputPasswordAdd').val();
  var ip = $('#inputIPAdd').val();
  var user = {
    name: username,
    password: password,
    active: active,
    ip: ip
  };
  $.ajax({
    url: '/admin/user',
    type: 'POST',
    data: user,
    headers: {"Authorization": "Bearer " + token},
    success: function(data) {
      // reload page after response from backend
      location.reload(true);
    }
  });
});

// on open delete user modal dialog
$('#dlgDeleteUser').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget);
  var user_obj = button.data('user-obj');
  localStorage.setItem("user_obj", user_obj);
  // prefill dialog by stored user data from base64 encoded value "user-obj"
  var user_obj_str = atob(user_obj);
  var user = JSON.parse(user_obj_str);
  var modal = $(this);
  modal.find('.modal-title').text('Delete User ' + user.name);
  modal.find('#deleteUserName').text('Do you want to delete User "' + user.name + '"?');
});

// delete user and close delete user modal dialog
$('#btnDeleteUser').click(function(){
  $('#dlgDeleteUser').modal('hide');
  var token = localStorage.getItem("token");
  var user_obj_str = atob(localStorage.getItem("user_obj"));
  localStorage.removeItem("user_obj");
  var user = JSON.parse(user_obj_str);
  $.ajax({
    url: '/admin/user/' + user._id,
    type: 'DELETE',
    headers: {"Authorization": "Bearer " + token},
    success: function(data) {
      // reload page after response from backend
      location.reload(true);
    }
  });
});
