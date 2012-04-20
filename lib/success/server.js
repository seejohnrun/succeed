var laze = require('laze');
var net = require('net');
var winston = require('winston');
var Incrementer = require('./incrementer');

var Server = function (config) {
  this.config = config || {};
  this.config.incrementers = this.config.incrementers || {};
  this.incrementers = [];
};

Server.prototype = {

  start: function () {
    var that = this;
    this.server.listen(this.port, this.host, function () {
      winston.info('listening', { port: that.port, host: that.host });
    });
  },

  findIncrementer: function (name) {
    var incr = this.incrementers[name];
    if (!incr) {
      winston.info('loaded an incrementer', { name: name });
      incr = this.incrementers[name] = new Incrementer({
        path: (this.config.incrementers.path || './data') + '/' + name,
        reserve: this.config.incrementers.reserve,
        jump: this.config.incrementers.jump
      });
    }
  },

  handleConnection: function (socket) {
    var that = this;
    socket.on('data', function (data) {
      var pieces, name, incrementer, count, next;
      pieces = data.toString().trim().split(':')
      name = pieces[0];
      incrementer = that.findIncrementer(name);
      count = parseInt(pieces[1], 10) || 1;
      next = that.incrementers[name].nextInts(count);
      socket.write(next.join(',') + '\r\n');
    });
  }

};

laze.defineAll(Server.prototype, {

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
