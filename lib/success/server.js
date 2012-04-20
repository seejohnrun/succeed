var laze = require('laze');
var net = require('net');
var winston = require('winston');
var Incrementer = require('./incrementer');

var Server = function (config) {
  this.config = config || {};
  this.mainIncrementer = new Incrementer({ path: 'count' });
};

Server.prototype = {

  start: function () {
    var that = this;
    this.server.listen(this.port, this.host, function () {
      winston.info('listening', { port: that.port, host: that.host });
    });
  },

  handleConnection: function (socket) {
    var next = this.mainIncrementer.nextInt();
    socket.end(next.toString(), 'utf8');
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
