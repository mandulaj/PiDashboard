/* PiDash.js
 *
 * a mini server for delivering the information about your raspberry pi to the world
 * given a server, a socket and a config file PiDash creates an object that automatically starts reading the system data
 * and sending it to the client on conntion
 *
 * the service is automatically stopped when all clients disconnect
 */


var pty = require('pty.js'),
  sysInfo = require("./sys_reader.js");

function PiDash(server, socketio, config) {

  var self = this;

  this.app = server;
  this.socketio = socketio;
  this.sysInfo = new sysInfo(config.updateFrequency);

  // SSH Term setup
  this.terms = []; // List of all ssh terms
  this.termLimit = config.termLimit; // The max number of Terms allowed
  this.termShell = config.termShell || 'bash'; // Shell to be used
  this.termSocket = this.socketio.of("/ssh"); // SSH socket
  this.termSocket.on('connection', function(socket) { // When a new browser instance connects
    socket.on('createNew', function(data) { // When the browser requests a new terminal
      self.handleCreateTerm(socket, data.cols, data.rows, function(err, info) { // create the terminal
        if (!err) {
          socket.emit('confirm', { // If all went well send a confirmation back to the browser with the term id
            id: info.id,
            windowID: data.windowID,
            tabID: data.tabID
          });
        }
      });
    });

    socket.on('data', function(id, data) { // When the browser sends some data
      self.handleTermData(id, data); // Route it to the correct terminal
    });

    socket.on('resize', function(id, size){
      self.handleTermResize(id, size.cols, size.rows);
    });

  });

  this.deliveryStatus = 0; // is top running
  this.frequency = config.updateFrequency;

  // when we get a connection start readeing
  this.socketio.of("/sysStat").on('connection', function(socket) {
    self.startDelivery(socket);

    // stop reading when we diconnect (reduces cpu imprint while idle)
    socket.on("disconnect", function() {
      self.stopDelivery(socket);
    });
  });
}

// Start the services and start emmiting the data to client
PiDash.prototype.startDelivery = function(socket) {
  if (this.deliveryStatus <= 0) {
    this.sysInfo.start(); // start sys_reader
  }
  this.deliveryStatus += 1;

  var self = this;
  socket.piInterval = setInterval(function() { // start pushing data periodically to the clinet
    socket.emit('info', {
      processes: self.sysInfo.getProcesses(),
      hardware: self.sysInfo.getHardware(),
      general: self.sysInfo.getGeneral()
    });
  }, this.frequency); // at what frequency
};


// Stop the service and save some coputation time
PiDash.prototype.stopDelivery = function(socket) {

  this.deliveryStatus -= 1;

  if (this.deliveryStatus <= 0) {

    this.sysInfo.stop(); // Stops sys_reader
    this.deliveryStatus = 0;
  }
  clearInterval(socket.piInterval); // stop sending data to client
};

// Spawns a new terminal and returns its id in the callback
PiDash.prototype.handleCreateTerm = function(socket, cols, rows, cb) {
  var self = this;

  // Allow the creation of new terminal only if the limit is not reached
  if (this.terms.length >= this.termLimit) {
    return cb(new Error("TermLimit Reached"), null);
  }

  // spawn a new pty instance
  var term = pty.fork(this.termShell, [], {
    name: 'xterm',
    cols: cols,
    rows: rows,
    cwd: '/home/pi/'
  });

  // Use the pty of the terminal as a way of referencing it
  var id = term.pty;
  this.terms[id] = term; // Add the terminal to the list of terminals

  // When the terminal sends data
  term.on('data', function(data) {
    socket.emit('data', id, data); // send it to the corresponding browser socket with the id
  });

  // When a terminal exits
  term.on('close', function() {
    socket.emit('kill', id); // send a kill message about the terminal to the browser
    if (self.terms[id]) delete self.terms[id]; // and remove it from the list
  });

  return cb(null, {
    id: id
  });
};

// Given and id, routes the data to the corresponding terminal if it exists
PiDash.prototype.handleTermData = function(id, data) {
  if (!this.terms[id]) {
    return false;
  }
  this.terms[id].write(data);
  return true;
};

// Destroys and removes a killed terminal from the list if it exists
PiDash.prototype.handleTermKill = function(id) {
  if (!this.terms[id]) {
    return;
  }
  this.terms[id].destroy();
  delete this.terms[id];
};

// Resizes given terminal to new cols and rows
PiDash.prototype.handleTermResize = function(id, cols, rows) {
  if (!this.terms[id]) {
    return;
  }
  this.terms[id].resize(cols, rows);
};



module.exports = PiDash;
