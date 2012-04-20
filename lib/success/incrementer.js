var fs = require('fs');
var laze = require('laze');
var winston = require('winston');

var Incrementer = function (config) {
  this.config = config;
  this.config.encoding = this.config.encoding || 'utf8';
  this.loadLast();
  this.reservedTo = this.last;
};

Incrementer.prototype = {

  loadLast: function () {
    var count;
    try {
      var count = fs.readFileSync(this.config.path, this.config.encoding);
      count = parseInt(count, 10);
    } catch (e) {
      // If its a missing file, that's okay
      if (e.code !== 'ENOENT') {
        throw e;
      }
    }
    this.last = count || 0;
    winston.info('loaded last', { last: this.last });
  },

  reserveNextBatch: function () {
    var nextMark = this.reservedTo + this.reserveSize;
    winston.info('reserving batch', { s: this.reserveSize, mark: nextMark });
    fs.writeFileSync(
      this.config.path,
      nextMark.toString(),
      this.config.encoding
    );
    this.reservedTo = nextMark;
  },

  nextInts: function (c) {
    var arr = new Array(c);
    for (var i = 0; i < c; i++) {
      arr[i] = this.nextInt();
    }
    winston.verbose('fetched ints', { mark: this.last, c: c });
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

laze.defineAll(Incrementer.prototype, {

  reserveSize: function () {
    return this.config.reserve || 100;
  },

  jump: function () {
    return this.config.jump || 1;
  }

});

module.exports = Incrementer;
