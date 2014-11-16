function Session(socket){
  this.terms = [];
  this.socket = socket;
  this.termDest =  document.getElementById("ssh");
}

Session.prototype.newTerminal = function(cb){
  var socket = this.socket,
    self = this;

  // Make a new terminal instance
  var term = new Terminal({
    cols: 80,
    rows: 24,
    useStyle: true,
    screenKeys: true,
    cursorBlink: true
  });

  // request the creation of a new terminal
  socket.emit('createNew', {
    cols: 80,
    rows: 34
  });

  // if we get a confirmation
  socket.on('confirm', function(data) {
    var id = data.id;
    term.on('data', function(data) {
      socket.emit('data', id, data);
    });

    term.on('title', function(title) {
      console.log(title);
    });

    term

    term.open(this.termDest);

    socket.on('data', function(id, data) {
      term.write(data);
    });

    socket.on('disconnect', function() {
      term.destroy();
      delete self.terms[id];
    });


    socket.on('kill', function(id){
      if(!self.term[id]) {
        self.term[id].destroy();
        delete self.term[id];
      }
    });

    self.terms[id] = term; // add the term to the list of terms

    //socket.removeListener('confirm')
  });
}


$(document).ready(function() {
  var socket = io("/ssh", {
    'query': 'token=' + sessionStorage.getItem("socketIOtoken")
  });

  socket.on('connect', function() {
  }

  });
});
