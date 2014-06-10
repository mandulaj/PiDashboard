$("#loginbtn").on("click", function(){
    var pass = true;
    $(".errormsg").html("");
    if (!checkUsername()) pass = false;
    if (!checkPassword()) pass = false;
    
    if(pass) {
        $.ajax({
            url: "/login",
            cache: false,
            data: {username: $("#username").val(), password: $("#password").val()},
            success: function(data, status){
                console.log(data)
            }
        })
    }
})

function chackUsername() {
    var user = $("#username");
    if (user.val() == "")
    {
        $(".errormsg").append("Enter Username")
        return false;
    }
    else
    {
        return true;
    }
}

function checkUsername() {
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