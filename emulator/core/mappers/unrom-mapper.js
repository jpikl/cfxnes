import { AbstractMapper } from "./abstract-mapper";

var
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

export function UNROMMapper(cartridge) {
  return UNROMMapper.__super__.constructor.call(this, "UNROM", cartridge);
}

extend(UNROMMapper, AbstractMapper);

UNROMMapper.prototype.init = function(cartridge) {
  UNROMMapper.__super__.init.call(this, cartridge);
  this.hasPRGRAM = true;
  return this.prgRAMSize = 0x2000;
};

UNROMMapper.prototype.reset = function() {
  this.mapPRGROMBank16K(0, 0);
  this.mapPRGROMBank16K(1, -1);
  this.mapPRGRAMBank8K(0, 0);
  return this.mapCHRRAMBank8K(0, 0);
};

UNROMMapper.prototype.write = function(address, value) {
  return this.mapPRGROMBank16K(0, value);
};
