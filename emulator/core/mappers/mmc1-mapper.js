import { AbstractMapper } from "./abstract-mapper";

var
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

export function MMC1Mapper(cartridge) {
  return MMC1Mapper.__super__.constructor.call(this, "MMC1", cartridge);
}

extend(MMC1Mapper, AbstractMapper);

MMC1Mapper.prototype.init = function(cartridge) {
  MMC1Mapper.__super__.init.call(this, cartridge);
  this.hasPRGRAM = true;
  return this.prgRAMSize = 0x8000;
};

MMC1Mapper.prototype.reset = function() {
  this.resetShiftRegister();
  this.resetBankRegisters();
  return this.synchronizeMapping();
};

MMC1Mapper.prototype.resetShiftRegister = function() {
  this.shiftRegister = 0;
  return this.writesCount = 0;
};

MMC1Mapper.prototype.resetBankRegisters = function() {
  this.controllRegister = 0x0C;
  this.prgBankRegister = 0;
  this.chrBankRegister1 = 0;
  return this.chrBankRegister2 = 0;
};

MMC1Mapper.prototype.write = function(address, value) {
  if (value & 0x80) {
    this.resetShiftRegister();
    this.controllRegister = this.controllRegister | 0x0C;
  } else {
    this.shiftRegister = this.shiftRegister | (value & 1) << this.writesCount;
    if (++this.writesCount >= 5) {
      this.copyShiftRegister(address);
      this.resetShiftRegister();
      this.synchronizeMapping();
    }
  }
  return value;
};

MMC1Mapper.prototype.copyShiftRegister = function(address) {
  switch (address & 0xE000) {
    case 0x8000:
      return this.controllRegister = this.shiftRegister;
    case 0xA000:
      return this.chrBankRegister1 = this.shiftRegister;
    case 0xC000:
      return this.chrBankRegister2 = this.shiftRegister;
    case 0xE000:
      return this.prgBankRegister = this.shiftRegister;
  }
};

MMC1Mapper.prototype.synchronizeMapping = function() {
  this.switchMirroring();
  this.switchPRGROMBanks();
  if (this.hasPRGRAM) {
    this.switchPRGRAMBank();
  }
  if (!this.hasCHRRAM) {
    this.switchCHRROMBanks();
  }
  if (this.hasCHRRAM) {
    return this.switchCHRRAMBanks();
  }
};

MMC1Mapper.prototype.switchMirroring = function() {
  switch (this.controllRegister & 0x03) {
    case 0:
      return this.setSingleScreenMirroring(0);
    case 1:
      return this.setSingleScreenMirroring(1);
    case 2:
      return this.setVerticalMirroring();
    case 3:
      return this.setHorizontalMirroring();
  }
};

MMC1Mapper.prototype.switchPRGROMBanks = function() {
  var base, offset;
  base = this.chrBankRegister1 & 0x10;
  offset = this.prgBankRegister & 0x0F;
  switch (this.controllRegister & 0x0C) {
    case 0x0C:
      this.mapPRGROMBank16K(0, base | offset);
      return this.mapPRGROMBank16K(1, base | 0x0F);
    case 0x08:
      this.mapPRGROMBank16K(0, base);
      return this.mapPRGROMBank16K(1, base | offset);
    default:
      return this.mapPRGROMBank32K(0, base | offset >>> 1);
  }
};

MMC1Mapper.prototype.switchPRGRAMBank = function() {
  return this.mapPRGRAMBank8K(0, this.chrBankRegister1 >>> 2);
};

MMC1Mapper.prototype.switchCHRROMBanks = function() {
  if (this.controllRegister & 0x10) {
    this.mapCHRROMBank4K(0, this.chrBankRegister1);
    return this.mapCHRROMBank4K(1, this.chrBankRegister2);
  } else {
    return this.mapCHRROMBank8K(0, this.chrBankRegister1 >>> 1);
  }
};

MMC1Mapper.prototype.switchCHRRAMBanks = function() {
  if (this.controllRegister & 0x10) {
    this.mapCHRRAMBank4K(0, this.chrBankRegister1);
    return this.mapCHRRAMBank4K(1, this.chrBankRegister2);
  } else {
    return this.mapCHRRAMBank8K(0, 0);
  }
};
