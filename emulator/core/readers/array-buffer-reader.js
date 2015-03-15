var AbstractReader,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AbstractReader = require("./abstract-reader");

function ArrayBufferReader(buffer) {
  ArrayBufferReader.__super__.constructor.call(this);
  this.view = new Uint8Array(buffer);
}

extend(ArrayBufferReader, AbstractReader);


ArrayBufferReader.prototype.getLength = function() {
  return this.view.length;
};

ArrayBufferReader.prototype.getData = function(start, end) {
  return this.view.subarray(start, end);
};

module.exports = ArrayBufferReader;
