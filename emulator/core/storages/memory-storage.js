var AbstractStorage,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AbstractStorage = require("./abstract-storage");

function MemoryStorage() {
  this.data = {};
}

extend(MemoryStorage, AbstractStorage);

MemoryStorage.prototype.read = function(key) {
  return this.data[key];
};

MemoryStorage.prototype.write = function(key, value) {
  return this.data[key] = value;
};

module.exports = MemoryStorage;
