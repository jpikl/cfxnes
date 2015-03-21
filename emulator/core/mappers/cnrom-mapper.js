var AbstractMapper,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AbstractMapper = require("./abstract-mapper");

function CNROMMapper(cartridge) {
  return CNROMMapper.__super__.constructor.call(this, "CNROM", cartridge);
}

extend(CNROMMapper, AbstractMapper);

CNROMMapper.prototype.init = function(cartridge) {
  CNROMMapper.__super__.init.call(this, cartridge);
  return this.hasPRGRAM = false;
};

CNROMMapper.prototype.reset = function() {
  this.mapPRGROMBank16K(0, 0);
  this.mapPRGROMBank16K(1, -1);
  return this.mapCHRROMBank8K(0, 0);
};

CNROMMapper.prototype.write = function(address, value) {
  return this.mapCHRROMBank8K(0, value);
};

module.exports = CNROMMapper;
