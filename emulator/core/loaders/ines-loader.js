var AbstractLoader, INES_SIGNATURE, Mirroring, TVSystem,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AbstractLoader = require("./abstract-loader");

Mirroring = require("../common/types").Mirroring;

TVSystem = require("../common/types").TVSystem;

INES_SIGNATURE = [0x4E, 0x45, 0x53, 0x1A];

function INESLoader() {
  return INESLoader.__super__.constructor.apply(this, arguments);
}

extend(INESLoader, AbstractLoader);


INESLoader.supportsInput = function(reader) {
  return this.containsSignature(reader, INES_SIGNATURE);
};

INESLoader.prototype.readCartridge = function() {
  this.readHeader();
  this.readTrainer();
  this.readPRGROM();
  return this.readCHRROM();
};

INESLoader.prototype.readHeader = function() {
  this.checkSignature(INES_SIGNATURE);
  this.readPRGROMSize();
  this.readCHRROMSize();
  this.readControlBytes();
  this.readByte8();
  this.readByte9();
  this.readByte10();
  this.readByte11();
  this.readByte12();
  this.readByte13();
  return this.readArray(2);
};

INESLoader.prototype.readPRGROMSize = function() {
  return this.cartridge.prgROMSize = this.readByte() * 0x4000;
};

INESLoader.prototype.readCHRROMSize = function() {
  this.cartridge.chrROMSize = this.readByte() * 0x2000;
  return this.cartridge.hasCHRRAM = this.cartridge.chrROMSize === 0;
};

INESLoader.prototype.readControlBytes = function() {
  var controlByte1, controlByte2;
  controlByte1 = this.readByte();
  controlByte2 = this.readByte();
  if (controlByte1 & 0x08) {
    this.cartridge.mirroring = Mirroring.FOUR_SCREEN;
  } else if (controlByte1 & 0x01) {
    this.cartridge.mirroring = Mirroring.VERTICAL;
  } else {
    this.cartridge.mirroring = Mirroring.HORIZONTAL;
  }
  this.cartridge.hasPRGRAMBattery = (controlByte1 & 0x02) !== 0;
  this.cartridge.hasTrainer = (controlByte1 & 0x04) !== 0;
  this.cartridge.isVsUnisistem = (controlByte2 & 0x01) !== 0;
  this.cartridge.isPlayChoice = (controlByte2 & 0x02) !== 0;
  return this.cartridge.mapperId = (controlByte2 & 0xF0) | (controlByte1 >>> 4);
};

INESLoader.prototype.readByte8 = function() {
  var unitsCount;
  unitsCount = Math.max(1, this.readByte());
  if (this.cartridge.hasCHRRAM) {
    return this.cartridge.chrRAMSize = unitsCount * 0x2000;
  }
};

INESLoader.prototype.readByte9 = function() {
  var flags;
  flags = this.readByte();
  return this.cartridge.tvSystem = flags & 0x01 ? TVSystem.PAL : TVSystem.NTSC;
};

INESLoader.prototype.readByte10 = function() {
  var flags;
  flags = this.readByte();
  if (flags & 0x02) {
    this.cartridge.tvSystem = TVSystem.PAL;
  }
  this.cartridge.hasPRGRAM = (flags & 0x10) === 0;
  return this.cartridge.hasBUSConflicts = (flags & 0x20) !== 0;
};

INESLoader.prototype.readByte11 = function() {
  return this.readByte();
};

INESLoader.prototype.readByte12 = function() {
  return this.readByte();
};

INESLoader.prototype.readByte13 = function() {
  return this.readByte();
};

INESLoader.prototype.readTrainer = function() {
  if (this.cartridge.hasTrainer) {
    return this.cartridge.trainer = this.readArray(0x200);
  }
};

INESLoader.prototype.readPRGROM = function() {
  return this.cartridge.prgROM = this.readArray(this.cartridge.prgROMSize);
};

INESLoader.prototype.readCHRROM = function() {
  return this.cartridge.chrROM = this.readArray(this.cartridge.chrROMSize);
};

module.exports = INESLoader;
