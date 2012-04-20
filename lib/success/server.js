var laze = require('laze');
var net = require('net');
var winston = require('winston');
var Incrementer = require('./incrementer');

var Server = function (config) {
  this.config = config || {};
};

Server.prototype = {

  start: function () {
    var that = this;
    this.server.listen(this.port, this.host, function () {
      winston.info('listening', { port: that.port, host: that.host });
    });
  },

  handleConnection: function (socket) {
    var that = this;
    socket.on('data', function (data) {
      var pieces = data.toString().split(':')
      var name = pieces[0];
      var incrementer = that.incrementers[name];
      if (incrementer) {
        var next = that.incrementers[name].nextInt();
        socket.write(next.toString() + '\r\n');
      }
      else {
        socket.write('!NO_SUCH_INCREMENTER\r\n');
      }
    });
  }

};

laze.defineAll(Server.prototype, {

  incrementers: function () {
    var incrs = {};
    for (var name in this.config.incrementers) {
      incrs[name] = new Incrementer(this.config.incrementers[name]);
    }
    return incrs;
  },

  host: function () {
    return this.config.host || '127.0.0.1';
  },

  port: function () {
    return this.config.port || 8080;
  },

  server: function () {
    var server = net.createServer();
    server.on('connection', this.handleConnection.bind(this));
    return server;
  }

});

module.exports = Server;
