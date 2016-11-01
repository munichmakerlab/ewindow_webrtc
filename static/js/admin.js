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

function loadUsers() {
  var token = localStorage.getItem("token");
  $.ajax({
    url: '/admin/user',
    type: 'GET',
    headers: {"Authorization": "Bearer " + token},
    success: function(data) {
      data.forEach(function(user) {
        $("#userlist").append("<tr>" +
                              "  <td><input type=\"checkbox\" class=\"checkthis\" /></td>" +
                              "  <td>" + user.name + "</td>" +
                              "  <td>" + user.ip + "</td>" +
                              "  <td>" + user.last_login + "</td>" + 
                              "  <td><p data-placement=\"top\" data-toggle=\"tooltip\" title=\"Edit\"><button class=\"btn btn-primary btn-xs\" data-title=\"Edit\" data-toggle=\"modal\" data-target=\"#edit\" ><span class=\"glyphicon glyphicon-pencil\"></span></button></p></td>" +
                              "  <td><p data-placement=\"top\" data-toggle=\"tooltip\" title=\"Delete\"><button class=\"btn btn-danger btn-xs\" data-title=\"Delete\" data-toggle=\"modal\" data-target=\"#delete\" ><span class=\"glyphicon glyphicon-trash\"></span></button></p></td" +
                              "</tr>"
                            );
      });
    }
  });
}
