var AbstractStorage,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AbstractStorage = require("../../core/storages/abstract-storage");


  function LocalStorage() {
    return LocalStorage.__super__.constructor.apply(this, arguments);
  }

  extend(LocalStorage, AbstractStorage);

  LocalStorage.prototype.read = function(key) {
    var ref;
    return (ref = window.localStorage) != null ? ref[this.getFullKey(key)] : void 0;
  };

  LocalStorage.prototype.write = function(key, value) {
    var ref;
    return (ref = window.localStorage) != null ? ref[this.getFullKey(key)] = value : void 0;
  };

  LocalStorage.prototype.getFullKey = function(key) {
    return "CFxNES/" + key;
  };

module.exports = LocalStorage;
