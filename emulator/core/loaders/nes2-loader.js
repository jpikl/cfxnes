var INESLoader, TVSystem,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

INESLoader = require("./ines-loader");

TVSystem = require("../common/types").TVSystem;

function NES2Loader() {
  return NES2Loader.__super__.constructor.apply(this, arguments);
}

extend(NES2Loader, INESLoader);

NES2Loader.supportsInput = function(reader) {
  var flags;
  if (INESLoader.supportsInput(reader)) {
    flags = reader.read(4);
    return flags.length === 4 && flags[3] & 0x0C === 0x08;
  } else {
    return false;
  }
};

NES2Loader.prototype.readByte8 = function() {
  var flags;
  flags = this.readByte();
  this.cartridge.mapperId |= (flags & 0x0F) << 8;
  return this.cartridge.subMapperId = (flags & 0xF0) >>> 4;
};

NES2Loader.prototype.readByte9 = function() {
  var flags;
  flags = this.readByte();
  this.cartridge.prgROMSize |= (flags & 0x0F) << 8;
  return this.cartridge.chrROMSize |= (flags & 0xF0) << 4;
};

NES2Loader.prototype.readByte10 = function() {
  var base, flags;
  flags = this.readByte();
  this.cartridge.prgRAMSizeBattery = (flags & 0xF0) >>> 4;
  this.cartridge.prgRAMSize = (flags & 0x0F) + this.cartridge.prgRAMSizeBattery;
  this.cartridge.hasPRGRAM = this.cartridge.prgRAMSize !== 0;
  return (base = this.cartridge).hasPRGRAMBattery || (base.hasPRGRAMBattery = this.cartridge.prgRAMSizeBattery !== 0);
};

NES2Loader.prototype.readByte11 = function() {
  var flags;
  flags = this.readByte();
  this.cartridge.chrRAMSizeBattery = (flags & 0xF0) >>> 4;
  this.cartridge.chrRAMSize = (flags & 0x0F) + this.cartridge.chrRAMSizeBattery;
  this.cartridge.hasCHRRAM = this.cartridge.chrRAMSize !== 0;
  return this.cartridge.hasCHRRAMBattery = this.cartridge.chrRAMSizeBattery !== 0;
};

NES2Loader.prototype.readByte12 = function() {
  var flags;
  flags = this.readByte();
  return this.cartridge.tvSystem = flags & 0x01 ? TVSystem.PAL : TVSystem.NTSC;
};

module.exports = NES2Loader;
