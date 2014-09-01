var sysInfo = require("./sys_reader.js")

function PiDash(server, socketio, config)
{
    'use strict'
    
    this.app = server;
    this.socketio = socketio;
    this.sysInfo = new sysInfo();
    
    var self = this;
    this.sysStat = this.socketio.of("/sysStat").on('connection', function(socket){
        self.startDelivery(socket)
        socket.on("disconnect", function(){
            self.stopDelivery(socket);
        })
    });
    
    this.frequency = 500;
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


PiDash.prototype.updateStats = function()
{
    var data = systemOverview()
    this.RAMstat = {
        free: data.freemem,
        used: data.totalmam - data.freemem,
        total: data.totalmem
    }

}

PiDash.prototype.startDelivery = function(socket)
{
    this.sysInfo.startReadingTop()
    var self = this; 
    socket.piInterval = setInterval(function(){
        socket.emit('info', {
            processes: self.sysInfo.processes
        });
    },this.frequency)
    
}

PiDash.prototype.stopDelivery = function(socket)
{
   this.sysInfo.stopReadingTop()
    this.deliveryStatus = false;
    clearInterval(socket.piInterval)
    
}


module.exports = PiDash;
