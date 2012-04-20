var fs = require('fs');
var winston = require('winston');
var Server = require('./lib/succeed/server');

// Load the config
var config = JSON.parse(fs.readFileSync('config.json'));

// Configure logging here
if (config.logging) {
  winston.remove(winston.transports.Console);
  var type, detail;
  for (var i = 0; i < config.logging.length; i++) {
    detail = config.logging[i];
    type = detail.type; delete detail.type;
    winston.add(winston.transports[type], detail);
  }
}

// Create a new server and start it
var server = new Server(config);
server.start();
