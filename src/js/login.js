$(document).ready(function() {

  localforage.getItem("username", function(value) {
    if (value !== null) {
      $("#username").val(value);
      $("#rememberMe").prop('checked', true);
    }
  });


  $("#loginbtn").on("click", function() {
    'use strict';
    var pass = true;
    $(".errormsg").html("");
    $(".errormsg").addClass("hidden");
    if (!checkUsername()) pass = false;
    if (!checkPassword()) pass = false;

    if (pass) {
      $.ajax({
        url: "/login",
        cache: false,
        type: "POST",
        dataType: "json",
        data: {
          username: $("#username").val(),
          password: $("#password").val()
        }
      }).done(function(data) {
        if (data.login) {
          if ($("#rememberMe").is(":checked")) {
            localforage.setItem("username", $("#username").val());
          } else {
            localforage.removeItem("username");
          }
          sessionStorage.setItem("socketIOtoken", data.token);
          window.location.replace("/rpi/home");
        } else {
          $(".errormsg").removeClass("hidden");
          $(".errormsg").html("Wrong Username and Password pair.");
        }
      });
    } else {
      $(".errormsg").removeClass("hidden");
    }
  });


  $("#form").submit(function(e) {
    'use strict';
    e.preventDefault();
  });

  function checkUsername() {
    'use strict';
    var user = $("#username");
    if (user.val() === "") {
      $(".errormsg").append("Enter Username<br>");
      return false;
    } else {
      return true;
    }
  }

  function checkPassword() {
    'use strict';
    var pass = $("#password");
    if (pass.val().length === 0) {
      $(".errormsg").append("Enter Password");
      return false;
    } else {
      return true;
    }
  }
});