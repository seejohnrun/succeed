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
      var pieces = data.toString().trim().split(':')
      var name = pieces[0];
      var incrementer = that.incrementers[name];
      var count = parseInt(pieces[1], 10) || 1;
      if (incrementer) {
        var next = that.incrementers[name].nextInts(count);
        socket.write(next.join(',') + '\r\n');
      }
      else {
        socket.write('!NO_SUCH_INCREMENTER\r\n');
        winston.warn('bad incrementer requested', { name: name });
      }
    });
  }

};

laze.defineAll(Server.prototype, {

  incrementers: function () {
    var incrs = {};
    var config;
    for (var name in this.config.incrementers) {
      config = this.config.incrementers[name];
      incrs[name] = new Incrementer(config);
      winston.info('loaded incremeter', { config: config });
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
