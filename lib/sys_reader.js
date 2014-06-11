var fs = require('fs'); 
var spawn = require('child_process').spawn; 

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

function Process( def ) {
    this.user = def[1];
    this.pid = def[0];
    this.pr  = def[2]
    this.ni = def[3];
    this.cpu = def[8];
    this.mem = def[9];
    this.vir = def[4];
    this.shr = def[6]
    this.res = def[5];
    this.state = def[7];
    this.time = def[10];
    this.command = def[11];
}

function SystemInfo() {
    this.topOutput = "";
    this.topBuffer = "";
    this.processes = []
}

SystemInfo.prototype.init = function() {

};

SystemInfo.prototype.startReadingTop = function()
{
    var thisObj = this;
    this.top = spawn('top', ['-b','-d 5']);
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
        console.log("Top end")
    })
}

SystemInfo.prototype.stopReadingTop = function()
{
    this.top.kill('SIGHUP');
    this.topBuffer = "";
}

SystemInfo.prototype.parseTop = function()
{
    if ( this.topOutput == "")
    {
        return null;
    }
    var lines = this.topOutput.split("\n");
    var sysData = lines.splice(0,9)
    
    for(var i = 0; i< lines.length; i++)
    {
        var process = lines[i].split(" ")
        process.remove("");
        this.processes.push(new Process(process));
    }
    
                                                               
}


SystemInfo.prototype.watch = function() {
    //fs.readFile("/proc/2028/stat", function(ev, file) {
    //    console.log("1")
    ///    console.log(ev);
    //    console.log(file.toString())
    // })
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

module.exports = SystemInfo;
