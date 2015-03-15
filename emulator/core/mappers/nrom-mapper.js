var AbstractMapper,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AbstractMapper = require("./abstract-mapper");

function NROMMapper() {
  return NROMMapper.__super__.constructor.apply(this, arguments);
}

extend(NROMMapper, AbstractMapper);

NROMMapper.prototype.init = function(cartridge) {
  NROMMapper.__super__.init.call(this, cartridge);
  return this.hasPRGRAM = false;
};

NROMMapper.prototype.reset = function() {
  this.mapPRGROMBank16K(0, 0);
  this.mapPRGROMBank16K(1, -1);
  return this.mapCHRROMBank8K(0, 0);
};

module.exports = NROMMapper;
