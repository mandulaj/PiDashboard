crypt3      = require("crypt3"),


function User(username)
{
    this.username = username;
}


User.prototype.authUser = function(username, password, cb)
{
    fs.readFile("/etc/shadow", function(err, data)
    {
        if(err) 
        {
            console.error("You need to be root!".red);
            process.exit(1);
        }

        var reg = new RegExp(username+".*\\n");

        data = data.toString();

        var line = data.match(reg)[0];

        var salt = line.match(/\$.*\$.*\$/)[0];

        var truePass = line.split(":")[1];

        if(crypt3(password, salt) === truePass)
        {
            cb(null, new User(username))
        }
        else
        {
            cb(new Error("PasswordError"), null);
        }
    });
}