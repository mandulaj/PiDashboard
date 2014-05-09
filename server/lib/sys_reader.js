var fs = require('fs'); 
var spawn = require('child_process').spawn; 


function Process( def ) {
    this.user = def[0];
    this.pid = def[1];
    this.cpu = def[2];
    this.mem = def[3];
    this.vsz = def[4];
    this.rss = def[5];
    this.tty = def[6];
    this.state = def[7];
    this.start = def[8];
    this.time = def[9];
    this.command = def[10];
}

function SystemInfo() {

}

SystemInfo.prototype.init = function() {
    this.proc = [];
};

SystemInfo.prototype.listProc = function()
{
/*
    exec("ps aux", function(err, stdo, stde){
        if(!err)
        {
            var procsList = []
            var procs = stdo.split("\n")
            for(var i = 0; i<procs.length; i++)
            {
                console.log(procs[i].split("  "))
               //procsList.push(new Process(procs[i].split("\t")))
            }
            console.log(procsList)
        }
        
    })
    */
    
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

var a = new SystemInfo()
a.listProc()
