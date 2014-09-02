/* PiDash.js
 *
 * a mini server for delivering the information about your raspberry pi to the world
 * given a server, a socket and a config file PiDash creates an object that automatically starts reading the system data
 * and sending it to the client on conntion
 *
 * the service is automatically stopped when all clients disconnect
*/ 

var sysInfo = require("./sys_reader.js")

function PiDash(server, socketio, config)
{
    'use strict'
    
    this.app = server;
    this.socketio = socketio;
    this.sysInfo = sysInfo;
    
    this.deliveryStatus = false;
    var self = this;

    // when we get a connection start readeing
    // TODO: start Delivery only at first connection (currently works for one user only)
    this.sysStat = this.socketio.of("/sysStat").on('connection', function(socket){
        self.startDelivery(socket);

        // stop reading when we diconnect (reduces cpu imprint while idle)
        // TODO: stop Delivery when last client disconnects
        socket.on("disconnect", function() {
            self.stopDelivery(socket);
        })
    });
    
    this.frequency = 1000;
    var self = this;

    this.raspberryStats = {
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
}

function systemOverview()
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

// Get hardware info about the computer
PiDash.prototype.updateStats = function()
{
    //TODO: we must update the cpu and all the other hardware info here
    
    var data = systemOverview()
    this.RAMstat = {
        free: data.freemem,
        used: data.totalmam - data.freemem,
        total: data.totalmem
    }

}

// Start the services and start emmiting the data to client
PiDash.prototype.startDelivery = function(socket)
{
    this.deliveryStatus  = true;
    this.sysInfo.start(); // start sys_reader
    var self = this; 
    socket.piInterval = setInterval(function(){ // start pushing data periodically to the clinet
        socket.emit('info', {
            processes: self.sysInfo.getProcesses();
        });
    }, this.frequency); // at what frequency
    
}


// Stop the service and save some coputation time
PiDash.prototype.stopDelivery = function(socket)
{
    this.sysInfo.stop(); // Stops sys_reader
    this.deliveryStatus = false;
    clearInterval(socket.piInterval); // stop sending data to client
}


module.exports = PiDash;
