var crypt3  = require("crypt3"),
    fs      = require('fs');


function User(username)
{
    this.username = username;
}


User.prototype.authUser = function(password, cb)
{
    fs.readFile("/etc/shadow", function(err, data)
    {
        if(err) 
        {
            console.error("You need to be root!".red);
            return cb(err, false)
        }

        var reg = new RegExp(this.username+".*\\n");

        data = data.toString();

        var line = data.match(reg)[0];

        var salt = line.match(/\$.*\$.*\$/)[0];

        var truePass = line.split(":")[1];

        if(crypt3(password, salt) === truePass)
        {
            cb(null, this.username)
        }
        else
        {
            cb(null, false);
        }
    });
}
