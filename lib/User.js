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
        
        data = data.toString();
        var lines = data.split("\n")

        var line = getUserLine(lines, self.username) 
        
        if (!line)
        {
            return cb(null, false) // user not in the file exit
        }

        var salt = line.match(/\$.*\$.*\$/); // extract the salt from the line
        if (salt != null) {
            salt = salt[0]
        } else {
            return cb(null, false)
        }
        
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

// runs through all lines and looks if any starts with username
// returns the line if username matches otherwise ""
function getUserLine(lines, username) {
    username += ":"; // terminates the username
    
    for (var i = 0; i < lines.length; i++) {
        var lineName = lines[i].slice(0, username.length);
        if (username === lineName) {
            return lines[i];
        }
    }
    return "";
}

module.exports = User;
