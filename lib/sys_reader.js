/* sys_reader.js
 *
 * a small library for low level process reading and parsing
 *
 * exposes an SystemInfo() object
 *
 * SystemInfo.start() - start an instance of top and start reading from the output
 * SystemInfo.stop() - stop the top instance and clear the memory
 * SystemInfo.getProcesses() - returns and array of processes
*/

var fs      = require('fs'),
    spawn   = require('child_process').spawn, 
    os      = require('os');
// We need to 
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

// Object used to store each process
function Process( def ) {
    this.user    = def[1]; // program started by user
    this.pid     = def[0]; // program's PID
    this.pr      = def[2]; // 
    this.ni      = def[3];
    this.cpu     = def[8]; // cpu usage
    this.mem     = def[9]; // ram usage
    this.vir     = def[4]; // virtual memory usage =
    this.shr     = def[6];
    this.res     = def[5];
    this.state   = def[7]; // 
    this.time    = def[10]; // runtime
    this.command = def[11]; // command used to start process
}

// Methods for starting top, reading and parsing output
function SystemInfo() {
    this.topOutput = ""; // complete output from top's one iteneration
    this.topBuffer = ""; // used to store output while we are not done reading
    this.processes = []; // list of parsed processes

    this.hardwareStats = {
        GPUstat: {
            temperature: 0
        }, 
        RAMstat: {
            free: 0,
            used: 0, 
            total: 0
        },
        CPUstat: {
            us: 0, // user cpu time (or) % CPU time spent in user space
            sy: 0, // system cpu time (or) % CPU time spent in kernel space
            ni: 0, // user nice cpu time (or) % CPU time spent on low priority processes
            id: 0, // idle cpu time (or) % CPU time spent idle
            wa: 0, // io wait cpu time (or) % CPU time spent in wait (on disk)
            hi: 0, // hardware irq (or) % CPU time spent servicing/handling hardware interrupts
            si: 0, // software irq (or) % CPU time spent servicing/handling software interrupts
            st: 0, // steal time - - % CPU time in involuntary wait by virtual cpu while hypervisor is servicing another processor (or) % CPU time stolen from a virtual machine
            temperature: 0,
            clockSpeed: 0
        }
    };


}


// Starts an instance of top 
SystemInfo.prototype.start = function()
{
    console.log("Top start")
    var thisObj = this;
    this.top = spawn('top', ['-b','-d 2']);
    this.top.stdout.on('data', function(data){
        var string = data.toString()
        if(/\s+top \- /.test(string))
        {
            thisObj.parseTop();
            thisObj.topOutput = thisObj.topBuffer;
            thisObj.topBuffer = string;
        }
        else
        {
            thisObj.topBuffer += string;
        }
    });
    this.top.on('exit', function(){
        console.log("Top end"); // DEBUG
    })
}

// Quit top instance
SystemInfo.prototype.stop = function()
{
    this.top.kill('SIGHUP');
    this.topBuffer = "";
}

// Return the array of processes
SystemInfo.prototype.getProcesses = function()
{
    return this.processes;
}

// Return object of hardware information
SystemInfo.prototype.getHardware = function()
{
    return this.hardwareStats;
}


// Return object of general information
SystemInfo.prototype.getGeneral = function()
{
    return {
        "hostname":os.hostname(),
        "type": os.type(),
        "platform" : os.platform(),
        "arch": os.arch(),
        "release": os.release(),
        "uptime": os.uptime(),
        //"loadavg": os.loadavg(),
        //"totalmem": os.totalmem(),
        //"freemem": os.freemem(),
        //"cpus": os.cpus(),
        //"netwok": os.networkInterfaces(),
    }
}

// Parse top's output and push Process objects to processes array
SystemInfo.prototype.parseTop = function()
{
    if ( this.topOutput == "")
    {
        return null;
    }
    var lines = this.topOutput.split("\n");
    var sysData = lines.splice(0,9); // remove first ten lines from the output (junk data -> header etc.)
    this.processes = [];
    for(var i = 0; i< lines.length; i++)
    {
        var process = lines[i].split(" ") //split the fields at spaces
        process.remove(""); // remove the blanks from the parsed data
        this.processes.push(new Process(process)); // make a new Process instance and push it to the array of processes
    }
    
                                                               
}

SystemInfo.prototype.updateHWinfo() = function() {
    
}

/* Test with using proc data(fast) instead of top(slow)
SystemInfo.prototype.watch = function() {
    fs.readFile("/proc/2028/stat", function(ev, file) {
        console.log("1")
        console.log(ev);
        console.log(file.toString())
    })
    fs.readdir("/proc",function(err, files){
        for (var i = 0; i < files.length; i++)
        {
            var d = files[i]
            if(/^\d+$/.test(d))
            {
                fs.readFile("/proc/"+d+"/stat",function(err, file){
                   console.log(file.toString())
                })
            }
        }
    })
}
*/

module.exports = new SystemInfo();
