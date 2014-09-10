$(document).ready(function(){

$("#loginbtn").on("click", function(){
    var pass = true;
    $(".errormsg").html("");
    $(".errormsg").addClass("hidden")
    if (!checkUsername()) pass = false;
    if (!checkPassword()) pass = false;
    
    if(pass) {
        $.ajax({
            url: "/login",
            cache: false,
            type: "POST",
            dataType: "json",
            data: {username: $("#username").val(), password: $("#password").val()}
        }).done(function(data){
            if (data.login)
            {
                sessionStorage.setItem("socketIOtoken", data.token);
                window.location.replace("/rpi/home");
            }
            else
            {
                $(".errormsg").removeClass("hidden");
                $(".errormsg").html("Wrong Username and Password pair.");
            }
        })
    }
    else
    {
        $(".errormsg").removeClass("hidden")
    }
})


$("#form").submit(function(e){
    console.log("test");
    e.preventDefault();
});

function checkUsername() {
    var user = $("#username");
    if (user.val() == "")
    {
        $(".errormsg").append("Enter Username<br>")
        return false;
    }
    else
    {
        return true;
    }
}

function checkPassword() {
    var pass = $("#password");
    if (pass.val().length === 0)
    {
        $(".errormsg").append("Enter Password")
        return false;
    }
    else
    {
        return true;
    }
}




})
