var crypt3  = require("crypt3"),
    fs      = require('fs');


function User(username)
{
    this.username = username;
}


User.prototype.passwordVerification = function(password, cb)
{
    var self = this;
    fs.readFile("/etc/shadow", function(err, data)
    {
        
        if(err) 
        {
            console.error("You need to be root!".red);
            return cb(err, false)
        }

        var reg = new RegExp(self.username+".*\\n");

        data = data.toString();

        var line = data.match(reg);
        if (line){
            line = line[0];
        }
        else
        {
            return cb(null, false)
        }

        var salt = line.match(/\$.*\$.*\$/)[0];

        var truePass = line.split(":")[1];

        if(crypt3(password, salt) === truePass)
        {
            cb(null, self.username)
        }
        else
        {
            cb(null, false);
        }
    });
}

module.exports = User;
