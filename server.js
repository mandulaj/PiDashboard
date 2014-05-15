// PiMonitor.js
var http        = require("http"),
    https       = require("https"),
    crypt3      = require("crypt3"),
    express     = require('express'),
    io          = require('socket.io'),
    path        = require("path"),
    fs          = require("fs"),
    os          = require("os"),
    colors      = require("colors"),
    optimist    = require("optimist").argv,
    config      = require("./config/config.json"), // config file
    port        = optimist.p || config.port,
    exec        = require('child_process').exec,
    
var app = express()


app.use("/static", express.static(__dirname + "/../public"));

function requireHTTPS(req, res, next) 
{
    if (!req.secure) 
    {
         //FYI this should work for local development as well
         return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
}

app.use(requireHTTPS);


if (config.forceSSL)
{
     var httpsOptions = {
            key: fs.readFileSync(this.https_keys.key).toString(),
            cert: fs.readFileSync(this.https_keys.cert).toString()
        };

        this.server = https.createServer(httpsOptions, this.app).listen(port, this.bindingSuccess);
    }
    else
    {
        this.server = http.createServer(this.app).listen(port, this.bindingSuccess);
    }

    this.socketio = io.listen(this.server);
}

function authUser(username, password, cb)
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


function checkSystem()
{
    if(os.type() != "Linux")
    {
        console.error("You are not running Linux. Exiting ... \n".red);
        process.exit(0);
    }
}

function checkOptions()
{

    if(optimist.help || optimist.h)
    {
        console.log("\n--------------------------- HELP -----------------------------".red + "\n                   " + "--- PiDashboard.js ---\n".green.bold.underline + "A Monitoring server for Raspberry Pi and other Linux computers." + "\nUsage: \n".bold );
        process.exit(0);
    }

    if(optimist.cert || optimist.key || https_pos)
    {
        https_pos = true;

        var cert = "",
            key = "";

        if (optimist.cert)  cert = optimist.cert;
        if (optimist.key)   key = optimist.key;

        if (!cert.length)   cert = "./server/keys/server.crt";
        if (!key.length)    key = "./server/keys/server.key";

        if (!fs.existsSync(key))
        {
            console.error("File ".red+ key.red.bold + " " + "doesn't exists!".red.underline );
            console.log("Can not start https server. Exiting ...".red);
            process.exit(1);
        }
        if (!fs.existsSync(cert))
        {
            console.error("File ".red + cert.red.bold + " " +"doesn't exists!".red.underline );
            console.log("Can not start https server. Exiting ...".red);
            process.exit(1);
        }

        
    }

}

function bindingSuccess()
{
    if()
    {
        console_sufix = "s:/";
    }
    else
    {
        console_sufix = ":/";
    }

    console.log("Server running at => ".green + "http" + console_sufix +"/localhost:" + port);
}

function getStdOutput(cmd,cb)
{
    exec(cmd,function (error, stdout, stderr) 
         {
             if (error !== null) 
             {
                 console.log('exec error: ' + error);
             }
             cb(stdout);
         });
}



function User(username)
{
    this.username = username;
}



raspberry = new PiDash();
