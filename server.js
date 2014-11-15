// PiMonitor.js

var http = require("http"), // needed for express server
  https = require("https"), // we want to be secure
  express = require('express'), // we need to route the users around efficiently
  passport = require('passport'), // used for authentication
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  bodyParser = require('body-parser'),

  // Following are used for user authentication
  fs = require("fs"),
  os = require("os"),

  colors = require("colors"), // make nice output
  optimist = require("optimist").argv,

  config = require("./config/config.json"), // config file

  port = optimist.p || config.port, // port we will use
  exec = require('child_process').exec,

  PiDash = require('./lib/PiDash.js'), // lib used for geting computer statistics
  flash = require('connect-flash'),
  socketioJwt = require("socketio-jwt");

var logger = require('morgan');
var app = express();
var server;
var socketio;
setup();

var passportConfig = require("./config/passport.js")(passport, config);


// Serving static files
app.use("/static", express.static(__dirname + "/public/static"));

//app.use(logger())
app.use(cookieParser());
app.use(bodyParser()); // TODO: Didn't work with bodyParser.json()
app.set('view engine', 'ejs');

app.use(session({
  secret: config.cookieSecret
})); // session secret
app.use(passport.initialize());
app.use(passport.session());

function requireHTTPS(req, res, next) {
    if (!req.secure) {
      return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
  }
  //app.use(requireHTTPS);

function setup() {
  'use strict';

  // Check OS (We only work on raspberry)
  if (os.type() != "Linux") {
    console.error("You are not running Linux. Exiting ... \n".red);
    // TODO: uncomment this at the end
    //process.exit(0);
  }


  // Help display
  if (optimist.help || optimist.h) {
    require('./lib/help_log.js');
    process.exit(0);
  }

  var cert = "", // Path to cert and key
    key = "";
  // Prepare keys and certs if we run https
  if (optimist.cert || optimist.key || config.forceSSL) {
    config.forceSSL = true;



    if (optimist.cert) cert = optimist.cert; // If provided from cmd
    if (optimist.key) key = optimist.key;

    if (!cert.length) cert = config.paths.cert; //else grab the default
    if (!key.length) key = config.paths.key;

    if (!fs.existsSync(key)) {
      console.error("File ".red + key.red.bold + " " + "doesn't exists!".red.underline);
      console.log("Can not start https server. Exiting ...".red);
      process.exit(1);
    }
    if (!fs.existsSync(cert)) {
      console.error("File ".red + cert.red.bold + " " + "doesn't exists!".red.underline);
      console.log("Can not start https server. Exiting ...".red);
      process.exit(1);
    }
  }
  // bind to server
  if (config.forceSSL) {
    var httpsOptions = {
      key: fs.readFileSync(key).toString(),
      cert: fs.readFileSync(cert).toString()
    };

    server = https.createServer(httpsOptions, app);
  } else {
    server = http.createServer(app);
  }
  var console_sufix;
  // listen on port
  server.listen(port, function() {
    if (config.forceSSL) {
      console_sufix = "s:/";
    } else {
      console_sufix = ":/";
    }

    console.log("Server running at => ".green + "http" + console_sufix + "/localhost:" + port);
  });

  socketio = require('socket.io')(server);
  socketio.use(socketioJwt.authorize({
    secret: config.socketIOSecret,
    handshake: true
  }));
}



require('./app/routes.js')(app, passport, config);


var raspberry = new PiDash(app, socketio, config);