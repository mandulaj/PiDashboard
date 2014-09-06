var crypt3  = require("crypt3"), // used for password authentication
    fs      = require('fs');


function User(username) // user object
{
    this.username = username;
}

// TODO: slow this function down!!!

// Verifies the password with the /etc/shadow file
// if valid password calls cb with (null, this.username) else (err, false)
User.prototype.passwordVerification = function(password, cb) {
    var self = this;
    fs.readFile("/etc/shadow", function(err, data) // read the shadow file
    {
        
        if(err) // ther was an error (most likely we are not root)
        {
            console.error("You need to be root!".red);
            return cb(err, false)
        }

        var reg = new RegExp(self.username+"\\:\\$.*\\n"); // search the file for the username of the user
        data = data.toString();

        var line = data.match(reg); // get the line with users password
        if (line){
            line = line[0]; // math will give us an array, we just want the first element
        }
        else
        {
            return cb(null, false) // user not in the file exit
        }
        var salt = line.match(/\$.*\$.*\$/)[0]; // extract the salt from the line

        var truePass = line.split(":")[1]; // get the password from the line (username:passwordString:irrelevantCrap...)

        if(crypt3(password, salt) === truePass) // crypt3 should return the exact passwordSting provided with the correct password and salt
        {
            cb(null, self.username) // we have a match so go ahead and return the username to indicate success
        }
        else
        {
            cb(null, false); // password hash did not match so return false
        }
    });
}

module.exports = User;
