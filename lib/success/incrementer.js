var fs = require('fs');
var winston = require('winston');

var Incrementer = function (name, config) {
  this.name = name;
  this.config = config;
  this.loadLast();
  this.jump = this.config.jump || 1;
  this.reserveSize = this.config.reserve || 100;
  this.reservedTo = this.last;
};

Incrementer.prototype = {

  loadLast: function () {
    var count;
    try {
      var count = fs.readFileSync(this.config.path);
      count = parseInt(count, 10);
    } catch (e) {
      // If its a missing file, that's okay
      if (e.code !== 'ENOENT') {
        throw e;
      }
    }
    this.last = count || 0;
    winston.info('loaded last', { last: this.last, name: this.name });
  },

  reserveNextBatch: function () {
    var nextMark = this.reservedTo + this.reserveSize;
    winston.info('reserving batch', {
      s: this.reserveSize, mark: nextMark, name: this.name
    });
    fs.writeFileSync(this.config.path, nextMark.toString);
    this.reservedTo = nextMark;
  },

  nextInts: function (c) {
    var arr = new Array(c);
    for (var i = 0; i < c; i++) {
      arr[i] = this.nextInt();
    }
    winston.verbose('fetched ints', {
      mark: this.last, c: c, name: this.name
    });
    return arr;
  },

  nextInt: function () {
    if (this.last >= this.reservedTo) {
      this.reserveNextBatch();
    }
    this.last += this.jump;
    return this.last;
  }

};

module.exports = Incrementer;
