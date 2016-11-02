$(document).ready(function() {
  var token = localStorage.getItem("token");
  var username = localStorage.getItem("user");
  if (token && username === 'eWindowMaster') {
    loadUsers();
  } else {
    location.assign("../");
  }
});


function renderTemplate(template, data) {
  var content = $('#'+template).html();
  $.each(data, function(key,val){
    var searchStr = '{{' + key + '}}';
    content = content.replace(searchStr, val);
  });
  return content;
}


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
        user.obj2 = user.obj;
        user.active_class = user.active ? 'success' : 'danger';
        user.active = user.active ? 'active' : 'deactive';
        user.ip = user.ip ? user.ip : 'Not defined';
        var template = renderTemplate('hidden-template', user);
        $("#userlist").append(template);
      });
    }
  });
}


$('#dlgEditUser').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget);
  var user_obj = button.data('user-obj');
  localStorage.setItem("user_obj", user_obj);
  var user_obj_str = atob(user_obj);
  var user = JSON.parse(user_obj_str);
  var modal = $(this);
  modal.find('.modal-title').text('Edit User ' + user.name);
  modal.find('#inputUserEdit').val(user.name);
  modal.find('#inputIPEdit').val(user.ip);
  modal.find('#inputActiveEdit').prop('checked', user.active);
});


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
      location.reload(true);
    }
  });
});


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
      location.reload(true);
    }
  });
});


$('#dlgDeleteUser').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget);
  var user_obj = button.data('user-obj');
  localStorage.setItem("user_obj", user_obj);
  var user_obj_str = atob(user_obj);
  var user = JSON.parse(user_obj_str);
  var modal = $(this);
  modal.find('.modal-title').text('Delete User ' + user.name);
  modal.find('#deleteUserName').text('Do you want to delete User "' + user.name + '"?');
});


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
      location.reload(true);
    }
  });
});
