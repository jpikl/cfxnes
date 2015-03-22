var AbstractMapper, Interrupt, Mirroring,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AbstractMapper = require("./abstract-mapper");

Interrupt = require("../common/types").Interrupt;

Mirroring = require("../common/types").Mirroring;


function MMC3(cartridge) {
  return MMC3.__super__.constructor.call(this, "MMC3", cartridge);
}

extend(MMC3, AbstractMapper);


MMC3.dependencies = ["cpu", "ppu", "cpuMemory", "ppuMemory"];

MMC3.prototype.inject = function(cpu, ppu, cpuMemory, ppuMemory) {
  MMC3.__super__.inject.call(this, cpuMemory, ppuMemory);
  this.cpu = cpu;
  return this.ppu = ppu;
};

MMC3.prototype.init = function(cartridge) {
  MMC3.__super__.init.call(this, cartridge);
  this.hasPRGRAM = true;
  this.prgRAMSize = 0x2000;
  return this.alternateMode = false;
};

MMC3.prototype.reset = function() {
  this.resetMapping();
  return this.resetRegisters();
};

MMC3.prototype.resetMapping = function() {
  this.mapPRGROMBank32K(0, -1);
  this.mapPRGRAMBank8K(0, 0);
  if (!this.hasCHRRAM) {
    this.mapCHRROMBank8K(0, 0);
  }
  if (this.hasCHRRAM) {
    return this.mapCHRRAMBank8K(0, 0);
  }
};

MMC3.prototype.resetRegisters = function() {
  this.command = 0;
  this.irqCounter = 0;
  this.irqLatch = 0;
  this.irqReload = 0;
  this.irqEnabled = 0;
  return this.irqDelay = 0;
};

MMC3.prototype.write = function(address, value) {
  switch (address & 0xE001) {
    case 0x8000:
      return this.command = value;
    case 0x8001:
      return this.writeBankSelect(value);
    case 0xA000:
      return this.writeMirroring(value);
    case 0xA001:
      return this.writePRGRAMEnable(value);
    case 0xC000:
      return this.irqLatch = value;
    case 0xC001:
      return this.writeIRQReload();
    case 0xE000:
      return this.writeIRQEnable(false);
    case 0xE001:
      return this.writeIRQEnable(true);
  }
};

MMC3.prototype.writeBankSelect = function(value) {
  switch (this.command & 7) {
    case 0:
    case 1:
      if (!this.hasCHRRAM) {
        return this.switchDoubleCHRROMBanks(value);
      }
      break;
    case 2:
    case 3:
    case 4:
    case 5:
      if (!this.hasCHRRAM) {
        return this.switchSingleCHRROMBanks(value);
      }
      break;
    case 6:
      return this.switchPRGROMBanks0And2(value);
    case 7:
      return this.switchPRGROMBank1(value);
  }
};

MMC3.prototype.writeMirroring = function(value) {
  if (this.mirroring !== Mirroring.FOUR_SCREEN) {
    return this.switchMirroring(value);
  }
};

MMC3.prototype.writePRGRAMEnable = function(value) {};

MMC3.prototype.writeIRQReload = function() {
  if (this.alternateMode) {
    this.irqReload = true;
  }
  return this.irqCounter = 0;
};

MMC3.prototype.writeIRQEnable = function(enabled) {
  this.irqEnabled = enabled;
  if (!enabled) {
    return this.cpu.clearInterrupt(Interrupt.IRQ_EXT);
  }
};

MMC3.prototype.switchDoubleCHRROMBanks = function(target) {
  var source;
  source = (this.command & 0x80) >>> 6 | this.command & 0x01;
  return this.mapCHRROMBank2K(source, target >>> 1);
};

MMC3.prototype.switchSingleCHRROMBanks = function(target) {
  var source;
  source = (~this.command & 0x80) >>> 5 | (this.command - 2) & 0x03;
  return this.mapCHRROMBank1K(source, target);
};

MMC3.prototype.switchPRGROMBanks0And2 = function(target) {
  var sourceA, sourceB;
  sourceA = (this.command & 0x40) >>> 5;
  sourceB = (~this.command & 0x40) >>> 5;
  this.mapPRGROMBank8K(sourceA, target);
  return this.mapPRGROMBank8K(sourceB, -2);
};

MMC3.prototype.switchPRGROMBank1 = function(target) {
  return this.mapPRGROMBank8K(1, target);
};

MMC3.prototype.switchMirroring = function(value) {
  if (value & 1) {
    return this.setHorizontalMirroring();
  } else {
    return this.setVerticalMirroring();
  }
};

MMC3.prototype.tick = function() {
  if (this.ppu.addressBus & 0x1000) {
    if (!this.irqDelay) {
      this.updateIRQCounter();
    }
    return this.irqDelay = 7;
  } else if (this.irqDelay) {
    return this.irqDelay--;
  }
};

MMC3.prototype.updateIRQCounter = function() {
  var irqCounterOld;
  irqCounterOld = this.irqCounter;
  if (!this.irqCounter || this.irqReload) {
    this.irqCounter = this.irqLatch;
  } else {
    this.irqCounter--;
  }
  if (this.irqEnabled && !this.irqCounter && (!this.alternateMode || !irqCounterOld || this.irqReload)) {
    this.cpu.activateInterrupt(Interrupt.IRQ_EXT);
  }
  return this.irqReload = false;
};

module.exports = MMC3;
