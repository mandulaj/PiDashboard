function PiDash(server, socketio, config)
{
    'use strict'
    
    this.app = server;
    this.socketio = socketio;
    var self = this;
    this.sysStat = this.socketio.of("/sysStat").on('connection', function(socket){
        self.startDelivery(socket)
        socket.on("diconnect", function(){
            self.stopDelivery();
        })
    });
    
    this.sysStat.on()
    
    
    
    
    this.deliveryStatus = false;   
    
    this.frequency = 500;
    //this.checkSystem();
    //this.checkOptions();
    //this.setupServer();
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
    if (!this.deliveryStatus)
    {
        this.deliveryStatus = true;
        var self = this; 
        this.emitterTimer = setInterval(function(){
            socket.emit('test', {
                test: "Hello"
            });
        },this.frequency)
    }
}

PiDash.prototype.stopDelivery = function()
{
    if (this.deliveryStatus)
    {
        this.deliveryStatus = false;
        clearInterval(this.emitterTimer)
    }
}


module.exports = PiDash;
