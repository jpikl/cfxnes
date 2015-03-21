var AbstractMapper,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AbstractMapper = require("./abstract-mapper");

function AOROM(cartridge) {
  return AOROM.__super__.constructor.call(this, "AOROM", cartridge);
}

extend(AOROM, AbstractMapper);

AOROM.prototype.init = function(cartridge) {
  AOROM.__super__.init.call(this, cartridge);
  return this.hasPRGRAM = false;
};

AOROM.prototype.reset = function() {
  this.mapPRGROMBank32K(0, 0);
  return this.mapCHRRAMBank8K(0, 0);
};

AOROM.prototype.write = function(address, value) {
  this.mapPRGROMBank32K(0, value);
  return this.setSingleScreenMirroring((value & 0x10) >>> 4);
};

module.exports = AOROM;
