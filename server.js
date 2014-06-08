// PiMonitor.js

var http        = require("http"),
    https       = require("https"),
    express     = require('express'),
    passport    = require('passport'),
    io          = require('socket.io'),
    crypt3      = require("crypt3"),
    fs          = require("fs"),
    os          = require("os"),
    
    colors      = require("colors"),
    optimist    = require("optimist").argv,
    
    config      = require("./config/config.json"), // config file
    
    port        = optimist.p || config.port,
    exec        = require('child_process').exec,
    
    PiDash      = require('./lib/PiDash.js'),
    flash       = require('connect-flash');

var app = express();
var server;
var socketio;
setup();

var passportConfig = require("./config/passport.js")(passport,config);


app.configure(function(){
    
    
    app.use(express.logger('dev'));
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    
    app.set('view engine', 'ejs');    
    
    app.use(express.session({ secret: config.cookieSecret })); // session secret
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    // Serving static files
    app.use("/static", express.static(__dirname + "/public/static"));
    
    function requireHTTPS(req, res, next) 
    {
        if (!req.secure) 
        {
             return res.redirect('https://' + req.get('host') + req.url);
        }
        next();
    }
    //app.use(requireHTTPS);
     
});

function setup() {
    'use strict';
    
    // Check OS (We only work on raspberry)
    if(os.type() != "Linux")
    {
        console.error("You are not running Linux. Exiting ... \n".red);
        process.exit(0);
    }
    
    
    // Help display
    if (optimist.help || optimist.h)
    {
        require('./lib/help_log.js');
        process.exit(0);
    }
    
    // Prepare keys and certs if we run https
    if (optimist.cert || optimist.key || config.forceSSL)
    {
        config.forceSSL = true;

        var cert = "", // Path to cert and key
            key = "";

        if (optimist.cert)  cert = optimist.cert; // If provided from cmd
        if (optimist.key)   key = optimist.key;

        if (!cert.length)   cert = config.paths.cert; //else grab the default 
        if (!key.length)    key = config.paths.key;

        if (!fs.existsSync(key))
        {
            console.error("File ".red+ key.red.bold + " " + "doesn't exists!".red.underline );
            console.log("Can not start https server. Exiting ...".red);
            process.exit(1);
        }
        if (!fs.existsSync(cert))
        {
            console.error("File ".red + cert.red.bold + " " + "doesn't exists!".red.underline );
            console.log("Can not start https server. Exiting ...".red);
            process.exit(1);
        }
    }
    
    // bind to server
    if (config.forceSSL)
    {
        var httpsOptions = {
            key: fs.readFileSync(key).toString(),
            cert: fs.readFileSync(cert).toString()
        };

        server = https.createServer(httpsOptions, app);
    }
    else
    {
        server = http.createServer(app);
    }

    // listen on port
    server.listen(port, function(){
        if(config.forceSSL)
        {
            var console_sufix = "s:/";
        }
        else
        {
            var console_sufix = ":/";
        }

        console.log("Server running at => ".green + "http" + console_sufix +"/localhost:" + port);
    });
    
    socketio = io.listen(server);
}



require('./app/routes.js')(app, passport, config)


var raspberry = new PiDash(app, socketio);
