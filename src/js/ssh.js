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
    tab.setTerminal(id, term);
    //Set tab to the terminal size
    tab.setSize(term.geometry[0], term.geometry[1]);
    // Set up the terminal write
    term.on('data', function(data) {
      socket.emit('data', id, data);
    });

    // Get the terminal title
    term.on('title', function(title) {
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
  var self = this;
  this.id = Math.floor(Math.random()*1e14); // random id
  this.session = session;
  this.tabs = []; // List of tabs in the window
  this.activeTab = 0; // Tab we are now on

  $("#ssh").append("<div class='window'></div>"); // Create the window container
  this.container = $("#ssh>div:last-child")[0]; // select the container

  $(this.container).append("<div class='bar'></div>"); // Setup bar
  var bar = $(this.container).children(".bar");
  bar.append("<span class='title'></span>"); // add title to bar
  $(this.container).append("<div class='tab'></div>"); //add tab (terminal container)
  $(this.container).append("<div class='ui-resizable-handle ui-resizable-se handle'></div>"); // add a handle for resizing
  $(this.container).draggable({ // make the window draggable
    handle: ".bar", // the handle we have prepared
    containment: "parent", // constrain the terminal only to area under the button
    stack: ".window", // updates the z-index of the group to get the window effect
    opacity: 0.7 // when we drag it, make the terminal more transparent
  }).css("position", "absolute"); // set the posiotioning of the draggable elements to absolute
  $(self.container).resizable({ // make the window resizable
    handles: {
      se: $(self.container).children('.handle') // add a handle
    },
    stop: function(ev, ui) { // when we stop resizing we must update the terminal on bothe the client and the server
      var x = ui.size.width / ui.originalSize.width; // get the percetage of increase for x and y
      var y = ui.size.height / ui.originalSize.height;
      self.tabs[self.activeTab].resize(x,y); // resize the local terminal (gets propagated to server)
      $(self.container).css("height", ""); // remove the height and width to snap the window to the size of the terminal
      $(self.container).css("width", "");
    }
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

// Sets the title of the window
Window.prototype.updateTitle = function(title){
  $(this.container).children("div").children("span.title").html(title);
};

// Remove the window
Window.prototype.destroy = function(){
  $(this.container).remove();
};

// Tab used to handle tab related operations
function Tab(window) {
  this.id = Math.floor(Math.random()*1e14);
  this.terminalID = null;
  this.terminal = null;
  this.window = window;
  this.title = "";
  this.size = {
    cols: 0,
    rows: 0
  };
  this.termContainer = $(this.window.container).children('.tab')[0];
}

// Set a local reperence to the underlying terminal and its id
Tab.prototype.setTerminal = function(id, term){
  this.terminalID = id;
  this.terminal = term;
};

// Remove the tab/window is no more tabs left
Tab.prototype.destroy = function(){
  if (this.window.tabs.length <= 1) {
    this.window.destroy();
  }
  $(this.termContainer).remove();
};

// Update the title of the tab (cascade down to window)
Tab.prototype.setTitle = function(title){
  this.title = title;
  this.window.updateTitle(title);
};

// Used to set the initial size of the tab
Tab.prototype.setSize = function(cols, rows) {
  this.size = {
    cols: cols,
    rows: rows
  };
};

// resize the tab's terminal to fit x, y pixels
Tab.prototype.resize = function(x, y) {
  var cols = Math.floor(this.size.cols * x);
  var rows = Math.floor(this.size.rows * y);
  this.size = {
    cols: cols,
    rows: rows
  };
  // resize the local terminal
  this.terminal.resize(cols, rows);
  // emit the resize to server
  this.window.session.socket.emit('resize', this.terminalID, this.size);
};

$(document).ready(function() {
  var socket = io("/ssh", {
    'query': 'token=' + sessionStorage.getItem("socketIOtoken")
  });
  // Session for ssh
  var session = new Session(socket);

  // Button for adding new terminals
  $("#addTerm").click(function(){
    session.createWindow();
  });
  socket.on('connect', function() {
    // TODO: set up checking for connection
  });
});
