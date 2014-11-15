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

  this.terms = [];
  this.termLimit = config.termLimit;
  this.termShell = config.termShell || 'bash';
  this.termSocket = this.socketio.of("/ssh");
  this.termSocket.on('connection', function(socket) {
    socket.on('createNew', function(data) {
      self.handleCreateTerm(data.cols, data.rows, function(err, info) {
        console.log(info)
        if (!err) {
          socket.emit('confirm', {
            id: info.id
          });
        }
      });
    });

    socket.on('data', function(id, data) {
      self.handleTermData(id, data);
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

PiDash.prototype.handleCreateTerm = function(cols, rows, cb) {
  var self = this;
  if (this.terms.length >= this.termLimit) {
    return cb(new Error("TermLimit Reached"), null);
  }

  var term = pty.fork(this.termShell, [], {
    name: 'xterm',
    cols: cols,
    rows: rows,
    cwd: '/home/pi/'
  });

  var id = term.pty;
  this.terms[id] = term;

  term.on('data', function(data) {
    self.termSocket.emit('data', id, data);
  });

  term.on('close', function() {
    self.termSocket.emit('kill', id);
    if (self.terms[id]) delete self.terms[id];
  });

  return cb(null, {
    id: id
  });
};

PiDash.prototype.handleTermData = function(id, data) {
  if (!this.terms[id]) {
    return;
  }
  this.terms[id].write(data);
};

PiDash.prototype.handleTermKill = function(id) {
  if (!this.terms[id]) {
    return;
  }
  this.terms[id].destroy();
  delete this.terms[id];
};

PiDash.prototype.handleTermResize = function(id, cols, rows) {
  if (!this.terms[id]) {
    return;
  }
  this.terms[id].resize(cols, rows);
};



module.exports = PiDash;