var RPi;

function RaspberryPi(model, stage3d) {
  'use strict';
  var self = this;
  this.model = $(model);
  this.rotateX = 70;
  this.rotateY = 0;
  this.rotateZ = 40;
  this.connected = true;
  this.infoBox = $(".info-content");

  this.processes = [];
  this.processTable = new ProcessTable("#processList", this);

  this.traqball = new Traqball({
    stage: stage3d,
    //axis: [0.5,1,0,0.25],
    prespective: 1000
  });

  this.components = {
    ethernet: new HWComponent("ethernet", this),
    usb: new HWComponent("usb", this),
    cpu: new HWComponent("cpu", this),
    ram: new HWComponent("ram", this),
    sd: new HWComponent("sd", this)
  };

  /*
  this.ledsControl = {

      leds: [
          $("led1"),
          $("led2"),
          $("led3"),
          $("led4"),
          $("led5")
      ],
      ledTimer: setTimer(function(){
          if()
      },10)
  }*/



  this.initSelf();
}

RaspberryPi.prototype.initSelf = function() {
  'use strict';
  var self = this;

  $("#default_button").click(function() {
    self.defaultPosition();
  });
  $("#logout_button").click(function() {
    sessionStorage.setItem("socketIOtoken", "");
  });


  this.socket = io("/sysStat", {
    'query': 'token=' + sessionStorage.getItem("socketIOtoken")
  });

  this.socket.on("info", function(data) {
    self.processes = data.processes;
    self.update();
  });


  // TODO: make the error hadeling work
  this.socket.on("error", function(error) {
    console.log("error");
    if (error.type == "UnauthorizedError" || error.code == "invalid_token") {
      console.log("Invalid token");

    }
  });
};

RaspberryPi.prototype.defaultPosition = function() {
  'use strict';
  //this.traqball.disable();
  this.model.addClass("picontainer_mover");
  this.model.css("-webkit-transform", "rotateX(58deg) rotateY(0deg) rotateZ(45deg)");
  this.model.css("transform", "rotateX(58deg) rotateY(0deg) rotateZ(45deg)");
  var self = this;
  setTimeout(function() {
    self.model.removeClass("picontainer_mover");
    //self.traqball.activate();
  }, 500);


};

RaspberryPi.prototype.hideAll = function() {
  'use strict';
  for (var key in this.components) {
    var comp = this.components[key];
    if (comp.out) {
      comp.animateIn();
    }
  }
};

RaspberryPi.prototype.renderInfo = function(comp) {
  'use strict';
  if (comp === null) {
    this.infoBox.html("<div id='default_info_content'>Click one of the components on the model to get information about it.</div>");
  } else {
    this.infoBox.html("");
  }
};

RaspberryPi.prototype.update = function() {
  'use strict';
  this.processTable.renderProcList();
};


// Object representing the List of processes
function ProcessTable(id, rpi) {
  'use strict';
  var self = this;
  this.table = $(id);
  this.list = $(id + " > tbody");
  this.rpi = rpi;

  this.searchBox = $("#procSearch");

  // Update when user stops typing for 0.5s
  var typingBreak;
  this.searchBox.keyup(function() {
    clearTimeout(typingBreak);
    typingBreak = setTimeout(function() {
      self.renderProcList();
    }, 500);
  });
  this.searchBox.keydown(function() {
    clearTimeout(typingBreak);
  });

  this.sort = 1; // id of the element we are sorting by
  this.reverse = false; // are we sorting in reverse?
  this.total = 0;

  $(id + " > thead > tr > th").click(function(data) {
    var clicked = $("> span", this);

    if (clicked.hasClass("sortActive")) {
      if (clicked.hasClass("glyphicon-sort-by-attributes")) {
        clicked.removeClass("glyphicon-sort-by-attributes");
        clicked.addClass("glyphicon-sort-by-attributes-alt");
        self.reverse = true;
      } else {
        clicked.addClass("glyphicon-sort-by-attributes");
        clicked.removeClass("glyphicon-sort-by-attributes-alt");
        self.reverse = false;
      }
      self.renderProcList();
    } else {
      self.reverse = false;
      self.sort = $(id + " > thead > tr > th").index(this);
      self.renderProcList();
      $(id + " > thead > tr > th span").each(function() {
        var element = $(this);
        element.removeClass("sortActive");
        element.removeClass("glyphicon-sort-by-attributes");
        element.removeClass("glyphicon-sort-by-attributes-alt");
        element.addClass("glyphicon-sort");
      });
      clicked.removeClass("glyphicon-sort");
      clicked.addClass("glyphicon-sort-by-attributes");
      clicked.addClass("sortActive");

    }
  });
}

ProcessTable.prototype.renderProcList = function() {
  'use strict';
  var self = this;

  function compare(a, b) {
    function compareDates(a, b) {
      var minutesA = a.split(":");
      var minutesB = b.split(":");

      var secondsA = minutesA[1].split(".");
      var secondsB = minutesB[1].split(".");

      if (parseInt(minutesA[0]) < parseInt(minutesB[0]))
        return -1;
      if (parseInt(minutesA[0]) > parseInt(minutesB[0]))
        return 1;

      if (parseInt(secondsA[0]) < parseInt(secondsB[0]))
        return -1;
      if (parseInt(secondsA[0]) > parseInt(secondsB[0]))
        return 1;

      if (parseInt(secondsA[1]) < parseInt(secondsB[1]))
        return -1;
      if (parseInt(secondsA[1]) > parseInt(secondsB[1]))
        return 1;

      return 0;
    }
    var ret = 0;

    switch (self.sort) {

      case 0: // PID
        if (parseInt(a.pid) < parseInt(b.pid))
          ret = -1;
        if (parseInt(a.pid) > parseInt(b.pid))
          ret = 1;
        break;

      case 1: // Command
        if (a.command.toLowerCase() < b.command.toLowerCase())
          ret = -1;
        if (a.command.toLowerCase() > b.command.toLowerCase())
          ret = 1;
        break;

      case 2: // User
        if (a.user.toLowerCase() < b.user.toLowerCase())
          ret = -1;
        if (a.user.toLowerCase() > b.user.toLowerCase())
          ret = 1;
        break;

      case 3: // CPU
        if (parseFloat(a.cpu) < parseFloat(b.cpu))
          ret = -1;
        if (parseFloat(a.cpu) > parseFloat(b.cpu))
          ret = 1;
        break;
      case 4: // RAM
        if (parseFloat(a.mem) < parseFloat(b.mem))
          ret = -1;
        if (parseFloat(a.mem) > parseFloat(b.mem))
          ret = 1;
        break;

      case 5: // VIR
        if (parseFloat(a.vir) < parseFloat(b.vir))
          ret = -1;
        if (parseFloat(a.vir) > parseFloat(b.vir))
          ret = 1;
        break;

      case 6: // Shr
        if (parseFloat(a.shr) < parseFloat(b.shr))
          ret = -1;
        if (parseFloat(a.shr) > parseFloat(b.shr))
          ret = 1;
        break;

      case 7: // Pr
        if (parseFloat(a.pr) < parseFloat(b.pr))
          ret = -1;
        if (parseFloat(a.pr) > parseFloat(b.pr))
          ret = 1;
        break;

      case 8: // Ni
        if (parseFloat(a.ni) < parseFloat(b.ni))
          ret = -1;
        if (parseFloat(a.ni) > parseFloat(b.ni))
          ret = 1;
        break;

      case 9: // Time
        ret = compareDates(a.time, b.time);
        break;

      case 10: // state
        if (a.state < b.state)
          ret = -1;
        if (a.state > b.state)
          ret = 1;
        break;


    }

    if (self.reverse) {
      ret *= -1;
    }
    return ret;
  }
  this.list.html("");
  var row = [];
  var i = 0;

  this.resetTotal();

  this.rpi.processes.sort(compare);
  for (var proc in this.rpi.processes) {
    if (!this.matchSearch(this.rpi.processes[proc])) {
      continue;
    }

    row = [];
    i = 0;

    row[i++] = "<tr>";
    row[i++] = "<td>" + this.rpi.processes[proc].pid + "</td>";
    row[i++] = "<td><strong>" + this.rpi.processes[proc].command + "</strong></td>";
    row[i++] = "<td>" + this.rpi.processes[proc].user + "</td>";
    row[i++] = "<td><em>" + this.rpi.processes[proc].cpu + "</em></td>";
    row[i++] = "<td><em>" + this.rpi.processes[proc].mem + "</em></td>";
    row[i++] = "<td>" + this.rpi.processes[proc].vir + "</td>";
    row[i++] = "<td>" + this.rpi.processes[proc].shr + "</td>";
    row[i++] = "<td>" + this.rpi.processes[proc].pr + "</td>";
    row[i++] = "<td>" + this.rpi.processes[proc].ni + "</td>";
    row[i++] = "<td>" + this.rpi.processes[proc].time + "</td>";
    row[i++] = "<td>" + this.rpi.processes[proc].state + "</td>";
    row[i++] = "</tr>";

    this.list.append(row.join(""));
    this.addToTotal(this.rpi.processes[proc]);
  }

  if (this.list.html() === "") {
    this.list.html("<h2>No results</h2>");
  } else {
    // append total
    row = [];
    i = 0;


    var procS = (this.total.num === 1) ? "" : "es";
    var userS = (this.total.users.length === 1) ? "" : "s";



    row[i++] = "<tr>";
    row[i++] = "<td><strong>Total</strong></td>";
    row[i++] = "<td>" + this.total.num + " process" + procS + " </td>";
    row[i++] = "<td>" + this.total.users.length + " user" + userS + "</td>";
    row[i++] = "<td><em>" + this.total.cpu.toFixed(1) + "</em></td>";
    row[i++] = "<td><em>" + this.total.mem.toFixed(1) + "</em></td>";
    row[i++] = "<td><em>" + this.total.vir.toFixed(1) + "</em></td>";
    row[i++] = "<td><em>" + this.total.shr.toFixed(1) + "</em></td>";
    row[i++] = "<td>-</td>";
    row[i++] = "<td>-</td>";
    row[i++] = "<td> " + this.total.time + " </td>";
    row[i++] = "<td> " + this.total.running + " running</td>";
    row[i++] = "</tr>";

    this.list.append(row.join(""));
  }
};

ProcessTable.prototype.addToTotal = function(obj) {
  'use strict';
  this.total.cpu += parseFloat(obj.cpu);
  this.total.mem += parseFloat(obj.mem);
  this.total.vir += parseFloat(obj.vir);
  this.total.shr += parseFloat(obj.shr);
  this.addTime(obj.time);
  this.total.num++;
  if (this.total.users.indexOf(obj.user) == -1) {
    this.total.users.push(obj.user);
  }
  if (obj.state === "R") {
    this.total.running++;
  }
};

ProcessTable.prototype.addTime = function(time) {
  'use strict';
  var carry;

  var oldTime = this.total.time.split(":"); // ["0", "00.00"]
  var addTime = time.split(":");

  var oldSecMil = oldTime[1].split("."); // ["00","00"]
  var addSecMil = addTime[1].split(".");

  var milliseconds = parseInt(oldSecMil[1]) + parseInt(addSecMil[1]);
  var newMilliseconds = milliseconds % 100;
  carry = (milliseconds - newMilliseconds) / 100;

  var seconds = parseInt(oldSecMil[0]) + parseInt(addSecMil[0]) + carry;
  var newSeconds = seconds % 60;
  carry = (seconds - newSeconds) / 60;

  var minutes = parseInt(oldTime[0]) + parseInt(addTime[0]) + carry;

  if (newMilliseconds < 10) {
    newMilliseconds = "0" + newMilliseconds;
  }

  if (newSeconds < 10) {
    newSeconds = "0" + newSeconds;
  }

  this.total.time = minutes + ":" + newSeconds + "." + newMilliseconds;
};

ProcessTable.prototype.resetTotal = function() {
  'use strict';
  this.total = {
    cpu: 0.0,
    mem: 0.0,
    vir: 0.0,
    shr: 0.0,
    time: "0:00.00",
    num: 0,
    users: [],
    running: 0
  };
};

// match each prop of object with search text
ProcessTable.prototype.matchSearch = function(object) {
  'use strict';
  var text = this.searchBox.val();
  var match = false;

  for (var el in object) {
    if (object[el].match(text) !== null) {
      match = true;
      break;
    }
  }

  return match;
};

function HWComponent(id, rpi) {
  'use strict';
  var self = this;
  this.parentRPi = rpi;
  this.id = id;
  this.element = $("." + id);
  this.moverClassOut = id + "-mover-out";
  this.moverClassIn = id + "-mover-in";
  this.moverClassExt = id + "-ext";
  this.out = false;



  this.element.click(function() {
    self.parentRPi.traqball.disable();

    if (self.out === false) {
      self.parentRPi.hideAll();
      self.parentRPi.renderInfo(self.id);
      if (self.id == "cpu") {
        self.parentRPi.components.ram.animateOut();
      }
      if (self.id == "ram") {
        self.parentRPi.components.cpu.animateOut();
      }

      self.parentRPi.defaultPosition();
      setTimeout(function() {
        self.animateOut();
      }, 500);
    } else {
      self.parentRPi.renderInfo(null);
      if (self.id == "cpu") {
        self.parentRPi.components.ram.animateIn();
      }
      if (self.id == "ram") {
        self.parentRPi.components.cpu.animateIn();
      }
      self.animateIn();
      setTimeout(function() {
        self.parentRPi.traqball.activate();
        console.log("Activated");
      }, 500);
    }
  });
}

HWComponent.prototype.animateOut = function() {
  'use strict';
  var self = this;
  this.element.addClass(this.moverClassOut);
  this.element.bind("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function() {
    self.element.addClass(self.moverClassExt);
    self.element.removeClass(self.moverClassOut);
    self.element.unbind("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd");
  });
  this.out = true;
};

HWComponent.prototype.animateIn = function() {
  'use strict';
  var self = this;
  this.element.removeClass(this.moverClassExt);
  this.element.addClass(this.moverClassIn);

  this.element.bind("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function() {
    self.element.removeClass(self.moverClassIn);
    self.element.unbind("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd");
  });
  this.out = false;
};

$(document).ready(function() {
  RPi = new RaspberryPi(".pi", "stage");
});