$(document).ready(function() {
  var socket = io("/ssh", {
    'query': 'token=' + sessionStorage.getItem("socketIOtoken")
  });
  var ssh = document.getElementById("ssh");
  var terms = [];
  socket.on('connect', function() {
    var term = new Terminal({
      cols: 80,
      rows: 24,
      useStyle: true,
      screenKeys: true,
      cursorBlink: true
    });
    socket.emit('createNew', {
      cols: 80,
      rows: 34
    });
    socket.on('confirm', function(data) {
      var id = data.id;
      console.log(data)
      term.on('data', function(data) {
        socket.emit('data', id, data);
      });

      term.on('title', function(title) {
        console.log(title);
      });

      term.open(ssh);

      socket.on('data', function(id, data) {
        term.write(data);
      });

      socket.on('disconnect', function() {
        term.destroy();
        delete terms[id];
      });

      terms[id] = term;
    });
  });
});