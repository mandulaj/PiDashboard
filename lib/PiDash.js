/* PiDash.js
 *
 * a mini server for delivering the information about your raspberry pi to the world
 * given a server, a socket and a config file PiDash creates an object that automatically starts reading the system data
 * and sending it to the client on conntion
 *
 * the service is automatically stopped when all clients disconnect
 */

var sysInfo = require("./sys_reader.js");

function PiDash(server, socketio, config) {
  'use strict';

  this.app = server;
  this.socketio = socketio;
  this.sysInfo = new sysInfo(config.updateFrequency);

  this.deliveryStatus = 0; // is top running
  var self = this;
  this.frequency = config.updateFrequency;

  // when we get a connection start readeing
  this.sysStat = this.socketio.of("/sysStat").on('connection', function(socket) {
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


module.exports = PiDash;