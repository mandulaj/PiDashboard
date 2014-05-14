// PiMonitor.js

var http        = require("http"),
    https       = require("https"),
    crypt3      = require("crypt3"),
    express     = require('express'),
    io          = require('socket.io'),
    url         = require("url"),
    path        = require("path"),
    fs          = require("fs"),
    os          = require("os"),
    colors      = require("colors"),
    optimist    = require("optimist").argv,
    config      = require("./config.json"),
    port        = optimist.p || config.port,
    exec        = require('child_process').exec,
    https_pos   = config.forceSSL;

function PiDash()
{
    'use strict'
    // Set up server
    this.app = express();

    this.https_keys = {
        key: "",
        cert: ""
    };

    this.checkSystem();
    this.checkOptions();
    this.setupServer();

    this.RaspberryStats = {
        GPUstat: {
            temperature: 0
        },
        RAMstat: {
            free: 0,
            used: 0,
            total: 0
        },
        CPUstat: {
            us: 0,
            sy: 0,
            ni: 0,
            id: 0,
            wa: 0,
            hi: 0,
            si: 0,
            st: 0,
            temperature: 0
        }
    };

    //this.exec = require('child_process').exec,
    //    child;

}

PiDash.prototype.setupServer = function()
{

    this.app.use("/", express.static(__dirname + "/../public"));


    function requireHTTPS(req, res, next) 
    {
        if (!req.secure) 
        {
            //FYI this should work for local development as well
            return res.redirect('https://' + req.get('host') + req.url);
        }
        next();
    }
    




    if (https_pos)
    {
        this.app.use(requireHTTPS);
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

PiDash.prototype.authUser = function(username, password, cb)
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

PiDash.prototype.systemOverview = function()
{
    return {
        "hostname":os.hostname(),
        "type": os.type(),
        "platform" : os.platform(),
        "arch": os.arch(),
        "release": os.release(),
        "uptime": os.uptime(),
        "loadavg": os.loadavg(),
        "totalmem": os.totalmem(),
        "freemem": os.freemem(),
        "cpus": os.cpus(),
        "netwok": os.networkInterfaces(),
    }
}


PiDash.prototype.updateStats = function()
{
    var data = this.systemOverview()
    this.RAMstat = {
        free: data.freemem,
        used: data.totalmam - data.freemem,
        total: data.totalmem
    }

}

PiDash.prototype.checkSystem = function()
{
    if(os.type() != "Linux")
    {
        console.error("You are not running Linux. Exiting ... \n".red);
        process.exit(0);
    }
}

PiDash.prototype.checkOptions = function()
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

        this.https_keys = {
            cert: cert,
            key: key
        }
    }

}

PiDash.prototype.bindingSuccess = function()
{
    if(https_pos)
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

/*
var getData = setInterval(function()
                          {

                              getStdOutput('cat /sys/class/thermal/thermal_zone0/temp',function(out)
                                           {    
                                               var temp = out/1000
                                               CPUstat.temperature = temp

                                           });
                              getStdOutput('ps -aux',function(out)
                                           {
                                               console.log(out)
                                           });
















                              //console.log(CPUstat)
                          },1000)










*/

function User(username)
{
    this.username = username;
}



raspberry = new PiDash();
