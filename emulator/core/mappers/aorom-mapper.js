import { AbstractMapper } from "./abstract-mapper";

var
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

export function AOROMMapper(cartridge) {
  return AOROMMapper.__super__.constructor.call(this, "AOROMMapper", cartridge);
}

extend(AOROMMapper, AbstractMapper);

AOROMMapper.prototype.init = function(cartridge) {
  AOROMMapper.__super__.init.call(this, cartridge);
  return this.hasPRGRAM = false;
};

AOROMMapper.prototype.reset = function() {
  this.mapPRGROMBank32K(0, 0);
  return this.mapCHRRAMBank8K(0, 0);
};

AOROMMapper.prototype.write = function(address, value) {
  this.mapPRGROMBank32K(0, value);
  return this.setSingleScreenMirroring((value & 0x10) >>> 4);
};
