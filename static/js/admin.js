$(document).ready(function() {
  var token = localStorage.getItem("token");
  var username = localStorage.getItem("user");
  if (token && username === 'eWindowMaster') {
    console.log('YEAH admin area');
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
        user.active = user.active ? 'checked' : '';
        var template = renderTemplate('hidden-template', user);
        /*var template = $('#hidden-template').html()
                        .replace('{USER_ACTIVE}', user.active ? 'checked':'')
                        .replace('{USER_NAME}', user.name)
                        .replace('{USER_IP}', user.ip)
                        .replace('{USER_LAST_LOGIN}', user.last_login);
        */
        $("#userlist").append(template);
      });
    }
  });
}
