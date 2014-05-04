// PiMonitor.js

var http        = require("http"),
    https       = require("https")
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
    this.GPUtemp = 0;
    this.RAMstat = {
        free: 0,
        used: 0,
        total: 0
    }
    this.CPUstat = {
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

    this.exec = require('child_process').exec,
    child;
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

function systemCheck()
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

    if(optimist.cert || optimist.key)
    {
        https_pos = true;
    
        var cert = "",
            key = "";

        if (optimist.cert)  cert = optimist.cert;
        if (optimist.key)   key = optimist.key;
    
        if (!cert.length)   cert = "./keys/cert.pem";
        if (!key.length)    key = "./keys/key.pem";
        
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





// Static fileserver 
//@TODO change to express

if (https_pos)
{
    var httpsOptions = {
        key: fs.readFileSync(key),
        cert: fs.readFileSync(cert)
    }
    var WebServer = https.createServer(httpsOptions, httpServer).listen(port,bindingSuccess);
    WebServer.on("error",function(er)
    {
        if(er.code == "EADDRINUSE")
        {
            console.error("Unable to bind to port " + port);
            port = config.backupPort;
            
            var WebServer = https.createServer(httpsOptions, httpServer).listen(port,bindingSuccess);
            WebServer.on("error",function(er)
            {
                if(er.code == "EADDRINUSE")
                {
                    console.error("Unable to bing to backup port "+ port);
                    process.exit(1);
                }
            });
            console.log("Success running on port "+ port);
        }
    });
}
else
{
    var WebServer = http.createServer(httpServer).listen(port,bindingSuccess);
    WebServer.on("error",function(er)
    {
        if(er.code == "EADDRINUSE")
        {
            console.error("Unable to bind to port " + port);
            port = config.backupPort;
            
            var WebServer = http.createServer(httpServer).listen(port,bindingSuccess);
            WebServer.on("error",function(er)
            {
                if(er.code == "EADDRINUSE")
                {
                    console.error("Unable to bing to backup port "+ port);
                    process.exit(1);
                }
            })
            console.log("Success running on port "+ port);
        }
    });
}

function httpServer(request, response) 
{
    var uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd(), "index", uri);
    fs.exists(filename, function(exists) 
    {
        if(!exists) 
        {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not Found\n");
            response.end();
            return;
        }
 
        if (fs.statSync(filename).isDirectory()) filename += '/index.html';
 
        fs.readFile(filename, "binary", function(err, file) 
        {
        
        if(err) 
        {        
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(err + "\n");
            response.end();
            return;
        }
 
        response.writeHead(200);
        response.write(file, "binary");
        response.end();
    });
});
}
 

function bindingSuccess()
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
