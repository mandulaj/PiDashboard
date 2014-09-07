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

// remove the given element from array (works for "")
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

function Filesystem( def ) {
    this.filesystem = def[0];
    this.type       = def[1];
    this.total      = def[2];
    this.used       = def[3];
    this.mounted    = def[6];
}


// Methods for starting top, reading and parsing output
function SystemInfo(frequency) {
    this.topOutput = ""; // complete output from top's one iteneration
    this.topBuffer = ""; // used to store output while we are not done reading
    this.processes = []; // list of parsed processes
    this.frequency = frequency;

    this.noVC = false; 

    this.hardware = {
        GPU: {
            temperature: 0
        }, 
        RAM: {
            free: 0,
            total: 0,
            swap: {
                free: 0,
                total: 0,
                cached: 0
            }
        },
        CPU: {
            time: {
                us: 0, // user cpu time (or) % CPU time spent in user space
                sy: 0, // system cpu time (or) % CPU time spent in kernel space
                ni: 0, // user nice cpu time (or) % CPU time spent on low priority processes
                id: 0, // idle cpu time (or) % CPU time spent idle
                wa: 0, // io wait cpu time (or) % CPU time spent in wait (on disk)
                hi: 0, // hardware irq (or) % CPU time spent servicing/handling hardware interrupts
                si: 0, // software irq (or) % CPU time spent servicing/handling software interrupts
                st: 0, // steal time - - % CPU time in involuntary wait by virtual cpu while hypervisor is servicing another processor (or) % CPU time stolen from a virtual machine
            },
            temperature: 0,
            clockSpeed: 0
        },
        SD: {
            fs: [],
        }
    };


}


// Starts an instance of top 
SystemInfo.prototype.start = function()
{
    console.log("Top start")
    var thisObj = this;
    var topFreq = "-d "+ this.frequency/1000.0; //Update only at the frequency needed
    
    this.top = spawn('top', ['-b', topFreq]);
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
    return this.hardware;
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
    sysData.remove(""); // remove the blank terms in array
    
    this.parseTopCPU(sysData[2]) // line with cpu%

    this.processes = [];
    for(var i = 0; i< lines.length; i++)
    {
        var process = lines[i].split(" ") //split the fields at spaces
        process.remove(""); // remove the blanks from the parsed data
        this.processes.push(new Process(process)); // make a new Process instance and push it to the array of processes
    }
    
    this.updateHWinfo() // Trigger and Update                                   
}

// Update the total CPU us,ni,sy,... etc
SystemInfo.prototype.parseTopCPU = function(line) {
    line = line.slice(8); // remove "%Cpu(s):"
    var values = line.split(","); // split the csv
    var i = 0;
    for(key in this.hardware.CPU.time) {
        var value = parseFloat(values[i].slice(0,6)); // remove the name
        this.hardware.CPU.time[key] = value; // update the value in hardwareStats
        i++;
    }

}

// Update most hardware information
SystemInfo.prototype.updateHWinfo = function() {
    var self = this;

    // Used to get temp and clock speed
    if (this.noVC) { // if we failed last time why try again
       // console.log("No vcgencmd")    
    }
    else
    {
        var clockMeasure = spawn('vcgencmd', ["measure_clock arm"]); // get clock speed
        clockMeasure.on('error', function(err){
            self.noVC = true; // well we failed so dont try again
        });
        clockMeasure.stdout.on("data", function(data){
            data = parseInt(data.toString().split("=")[1])
            self.hardware.CPU.clockSpeed = data;
        });

        var tempMeasure = spawn('vcgencmd', ["measure_temp"]); //get GPU temp
        tempMeasure.on('error', function(){
            self.noVC = true;
        });
        tempMeasure.stdout.on("data", function(data){
            data = parseFloat(data.toString().split("=")[1]);
            self.hardware.GPU.temperature = data;
            self.hardware.CPU.temperature = data; // TODO: get true CPU data
        });    
    }

    // Used to get SD info
    var df = spawn("df", ["-aT"]);
    df.stdout.on("data", function(data){
        var filesys = [];
        var lines = data.toString().split("\n");
        lines.splice(0,1);
        lines.remove("");
        
        var inFSflag = false;
        for (var i = 0; i< lines.length; i++)
        {
            var line = lines[i].split(" ");
            line.remove("");
            
            // We want unique filesystems only
            inFSflag = false;
            for(var j = 0; j < filesys.length; j++) {
                if (filesys[j].mounted == line[6]) {
                    inFSflag = true;
                    break;
                }
            }
            if (!inFSflag) { // push only is unique
                filesys.push(new Filesystem(line));
            }
        }
        self.hardware.SD.fs = filesys;
    });

    // TODO: read this from proc data
    this.hardware.RAM.free = os.freemem();
    this.hardware.RAM.total = os.totalmem();
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

module.exports = SystemInfo;
