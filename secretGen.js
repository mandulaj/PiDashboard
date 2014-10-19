var crypto = require('crypto');
var fs = require('fs');

var config = require('./config/config.json');

crypto.randomBytes(config.secret.length, function(err, buf1){
  if (err) {
    return console.log("Error getting random bytes.");
  }
  crypto.randomBytes(config.secret.length, function(err, buf2){
    if (err) {
      return console.log("Error getting random bytes.");
    }
    config.cookieSecret = buf1.toString(config.secret.encoding);
    config.socketIOSecret = buf2.toString(config.secret.encoding);

    fs.writeFileSync("./config/config.json", JSON.stringify(config, null, 2));
  });
});
