function Session(socket) {
  var self = this;

  this.terms = []; // Array of all the terminal references
  this.windows = []; // Array of all windows
  this.socket = socket; // socket used to communicate with server


  this.socket.on('confirm', function(data) {
    var socket = self.socket;

    // Find the window that requested the creation of a new Terminal
    var window = self.findWindow(data.windowID);
    if (window === -1) {
      socket.emit('kill', data.id);
      return;
    }
    // Find the tab in the window that requested a new Terminal
    var tab = window.findTab(data.tabID);
    if (tab === -1) {
      socket.emit('kill', data.id);
      return;
    }

    // Make a new terminal instance
    var term = new Terminal({
      cols: 80,
      rows: 24,
      useStyle: true,
      screenKeys: true,
      cursorBlink: true
    });

    // Get the terminal id which the server provided
    var id = data.id;
    tab.setTerminalId(id);
    // Set up the terminal write
    term.on('data', function(data) {
      socket.emit('data', id, data);
    });

    // Get the terminal title
    term.on('title', function(title) {
      console.log(title);
      tab.setTitle(title);
    });

    // open the terminal in the tab
    term.open(tab.termContainer);


    self.terms[id] = term; // add the term to the list of terms

    //socket.removeListener('confirm')
  });

  // on data rout the it to the correct terminal using the id
  socket.on('data', function(id, data) {
    if (self.terms[id]) {
      self.terms[id].write(data);
    }
  });

  /* Disconnect all terms
  socket.on('disconnect', function() {
    term.destroy();
    delete self.terms[id];
  });*/

  //TODO remove the tac/window on exit
  socket.on('kill', function(id) {
    if (self.terms[id]) {
      var tab = self.findTerminalTab(id);

      if (tab !== -1) {
        self.terms[id].destroy();
        delete self.terms[id];
        tab.destroy();
      }
    }
  });

}

// request a new terminal
Session.prototype.newTerminal = function(windowID, tabID) {
  var socket = this.socket;

  // request the creation of a new terminal
  socket.emit('createNew', {
    cols: 80,
    rows: 34,
    windowID: windowID,
    tabID: tabID
  });

};

Session.prototype.createWindow = function() {
  var window = new Window(this);
  this.windows.push(window);
};

// Find a window in the session using its id
Session.prototype.findWindow = function(id) {
  for (var i in this.windows) {
    if (this.windows[i].id === id) {
      return this.windows[i];
    }
  }
  return -1;
};

// Find a tab using the terminal id
Session.prototype.findTerminalTab = function(id) {
  for (var i in this.windows) {
    for (var j in this.windows[i].tabs) {
      if (this.windows[i].tabs[j].terminalID === id) {
        return this.windows[i].tabs[j];
      }
    }
  }
  return -1;
};

function Window(session){
  this.id = Math.floor(Math.random()*1e14); // random id
  this.session = session;
  this.tabs = []; // List of tabs in the window

  $("#ssh").append("<div class='window'></div>"); // Create the window container
  this.container = $("#ssh>div:last-child")[0]; // select the container

  $(this.container).append("<div class='bar'></div>");
  var bar = $(this.container).children(".bar");
  bar.append("<span class='title'></span>");

  $(this.container).draggable({
    handle: ".bar",
    containment: "parent",
    stack: ".window",
    opacity: 0.7
  });
  // Create first tab
  this.createTab();
}

// Create a new tab in the window
Window.prototype.createTab = function(){
  var tab = new Tab(this);
  this.tabs.push(tab);
  this.session.newTerminal(this.id, tab.id);
};

// Find the tab in window using its id
Window.prototype.findTab = function(id) {
  for(var i in this.tabs) {
    if (this.tabs[i].id === id) {
      return this.tabs[i];
    }
  }
  return -1;
};

Window.prototype.updateTitle = function(title){
  $(this.container).children("div").children("span.title").html(title);
};

Window.prototype.destroy = function(){
  $(this.container).remove();
};

function Tab(window) {
  this.id = Math.floor(Math.random()*1e14);
  this.terminalID = null;
  this.window = window;
  this.title = "";
  $(this.window.container).append("<div class='tab'></div>");
  this.termContainer = $(this.window.container).children().last()[0];
}

Tab.prototype.setTerminalId = function(id){
  this.terminalID = id;
};

Tab.prototype.destroy = function(){
  if (this.window.tabs.length <= 1) {
    this.window.destroy();
  }
  $(this.termContainer).remove();
};

Tab.prototype.setTitle = function(title){
  console.log(title);
  this.title = title;
  this.window.updateTitle(title);
};


$(document).ready(function() {
  var socket = io("/ssh", {
    'query': 'token=' + sessionStorage.getItem("socketIOtoken")
  });
  session = new Session(socket);

  socket.on('connect', function() {

    session.createWindow();
    session.createWindow();

    /*
    session.newTerminal();
    session.newTerminal(document.getElementById("ssh2"));
    session.newTerminal(document.getElementById("ssh3"));
  */
  });
});
