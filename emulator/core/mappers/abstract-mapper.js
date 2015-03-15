var Mirroring, computeMD5, logger, readableSize, system, wordAsHex;

Mirroring = require("../common/types").Mirroring;

computeMD5 = require("../utils/convert").computeMD5;

wordAsHex = require("../utils/format").wordAsHex;

readableSize = require("../utils/format").readableSize;

logger = require("../utils/logger").get();

system = require("../utils/system");

AbstractMapper.prototype.inject = function(cpuMemory, ppuMemory) {
  this.cpuMemory = cpuMemory;
  return this.ppuMemory = ppuMemory;
};

AbstractMapper.dependencies = ["cpuMemory", "ppuMemory"];

function AbstractMapper(cartridge) {
  logger.info("Constructing mapper");
  this.init(cartridge);
  this.createPRGRAM();
  this.createCHRRAM();
  this.printPRGRAMInfo();
  this.printCHRRAMInfo();
}

AbstractMapper.prototype.init = function(cartridge) {
  var ref, ref1;
  this.mirroring = cartridge.mirroring;
  this.hasPRGRAM = cartridge.hasPRGRAM;
  this.hasPRGRAMBattery = cartridge.hasPRGRAMBattery;
  this.hasCHRRAM = cartridge.hasCHRRAM;
  this.hasCHRRAMBattery = cartridge.hasCHRRAMBattery;
  this.prgROMSize = (ref = cartridge.prgROMSize) != null ? ref : cartridge.prgROM.length;
  this.prgRAMSize = cartridge.prgRAMSize;
  this.prgRAMSizeBattery = cartridge.prgRAMSizeBattery;
  this.chrROMSize = (ref1 = cartridge.chrROMSize) != null ? ref1 : cartridge.chrROM.length;
  this.chrRAMSize = cartridge.chrRAMSize;
  this.chrRAMSizeBattery = cartridge.chrRAMSizeBattery;
  this.prgROM = cartridge.prgROM;
  return this.chrROM = cartridge.chrROM;
};

AbstractMapper.prototype.reset = function() {};

AbstractMapper.prototype.write = function(address, value) {
  return value;
};

AbstractMapper.prototype.tick = function() {};

AbstractMapper.prototype.powerUp = function() {
  logger.info("Resetting mapper");
  this.resetPRGRAM();
  this.resetCHRRAM();
  return this.reset();
};

AbstractMapper.prototype.mapPRGROMBank32K = function(srcBank, dstBank) {
  return this.mapPRGROMBank8K(srcBank, dstBank, 4);
};

AbstractMapper.prototype.mapPRGROMBank16K = function(srcBank, dstBank) {
  return this.mapPRGROMBank8K(srcBank, dstBank, 2);
};

AbstractMapper.prototype.mapPRGROMBank8K = function(srcBank, dstBank, ratio) {
  var i, j, maxBank, ref;
  if (ratio == null) {
    ratio = 1;
  }
  srcBank = ratio * srcBank;
  dstBank = ratio * dstBank;
  maxBank = (this.prgROMSize - 1) >> 13;
  for (i = j = 0, ref = ratio; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
    this.cpuMemory.mapPRGROMBank(srcBank + i, (dstBank + i) & maxBank);
  }
  return void 0;
};

AbstractMapper.prototype.createPRGRAM = function() {
  if (this.hasPRGRAM) {
    this.prgRAM = system.newUint8Array(this.prgRAMSize);
    if (this.hasPRGRAMBattery && (this.prgRAMSizeBattery == null)) {
      this.prgRAMSizeBattery = this.prgRAMSize;
    }
  }
  return void 0;
};

AbstractMapper.prototype.resetPRGRAM = function() {
  var clearFrom, i, j, ref, ref1;
  if (this.hasPRGRAM) {
    clearFrom = this.hasPRGRAMBattery ? this.prgRAMSizeBattery : 0;
    for (i = j = ref = clearFrom, ref1 = this.prgRAMSize; ref <= ref1 ? j < ref1 : j > ref1; i = ref <= ref1 ? ++j : --j) {
      this.prgRAM[i] = 0;
    }
  }
  return void 0;
};

AbstractMapper.prototype.loadPRGRAM = function(storage) {
  if (this.hasPRGRAM && this.hasPRGRAMBattery) {
    return storage.readData(this.getPRGRAMKey(), this.prgRAM);
  }
};

AbstractMapper.prototype.savePRGRAM = function(storage) {
  if (this.hasPRGRAM && this.hasPRGRAMBattery) {
    return storage.writeData(this.getPRGRAMKey(), this.prgRAM.slice(0, this.prgRAMSizeBattery));
  }
};

AbstractMapper.prototype.getPRGRAMKey = function() {
  return this.prgRAMKey != null ? this.prgRAMKey : this.prgRAMKey = (computeMD5(this.prgROM)) + "/PRGRAM";
};

AbstractMapper.prototype.mapPRGRAMBank8K = function(srcBank, dstBank) {
  var maxBank;
  maxBank = (this.prgRAMSize - 1) >> 13;
  return this.cpuMemory.mapPRGRAMBank(srcBank, dstBank & maxBank);
};

AbstractMapper.prototype.printPRGRAMInfo = function() {
  logger.info("==========[Mapper PRG RAM Info - Start]==========");
  logger.info("has PRG RAM           : " + this.hasPRGRAM);
  logger.info("has PRG RAM battery   : " + this.hasPRGRAMBattery);
  logger.info("PRG RAM size          : " + (readableSize(this.prgRAMSize)));
  logger.info("PRG RAM size (battery): " + (readableSize(this.prgRAMSizeBattery)));
  return logger.info("==========[Mapper PRG RAM Info - End]==========");
};

AbstractMapper.prototype.mapCHRROMBank8K = function(srcBank, dstBank) {
  return this.mapCHRROMBank1K(srcBank, dstBank, 8);
};

AbstractMapper.prototype.mapCHRROMBank4K = function(srcBank, dstBank) {
  return this.mapCHRROMBank1K(srcBank, dstBank, 4);
};

AbstractMapper.prototype.mapCHRROMBank2K = function(srcBank, dstBank) {
  return this.mapCHRROMBank1K(srcBank, dstBank, 2);
};

AbstractMapper.prototype.mapCHRROMBank1K = function(srcBank, dstBank, ratio) {
  var i, j, maxBank, ref;
  if (ratio == null) {
    ratio = 1;
  }
  srcBank = ratio * srcBank;
  dstBank = ratio * dstBank;
  maxBank = (this.chrROMSize - 1) >> 10;
  for (i = j = 0, ref = ratio; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
    this.ppuMemory.mapPatternsBank(srcBank + i, (dstBank + i) & maxBank);
  }
  return void 0;
};

AbstractMapper.prototype.createCHRRAM = function() {
  if (this.hasCHRRAM) {
    this.chrRAM = system.newUint8Array(this.chrRAMSize);
    if (this.hasCHRRAMBattery && (this.chrRAMSizeBattery == null)) {
      this.chrRAMSizeBattery = this.chrRAMSize;
    }
  }
  return void 0;
};

AbstractMapper.prototype.resetCHRRAM = function() {
  var clearFrom, i, j, ref, ref1;
  if (this.hasCHRRAM) {
    clearFrom = this.hasCHRRAMBattery ? this.chrRAMSizeBattery : 0;
    for (i = j = ref = clearFrom, ref1 = this.chrRAMSize; ref <= ref1 ? j < ref1 : j > ref1; i = ref <= ref1 ? ++j : --j) {
      this.chrRAM[i] = 0;
    }
  }
  return void 0;
};

AbstractMapper.prototype.loadCHRRAM = function(storage) {
  if (this.hasCHRRAM && this.hasCHRRAMBattery) {
    return storage.readData(this.getCHRRAMKey(), this.chrRAM);
  }
};

AbstractMapper.prototype.saveCHRRAM = function(storage) {
  if (this.hasCHRRAM && this.hasCHRRAMBattery) {
    return storage.writeData(this.getCHRRAMKey(), this.chrRAM.slice(0, this.chrRAMSizeBattery));
  }
};

AbstractMapper.prototype.getCHRRAMKey = function() {
  return this.chrRAMKey != null ? this.chrRAMKey : this.chrRAMKey = (computeMD5(this.prgROM)) + "/CHRRAM";
};

AbstractMapper.prototype.mapCHRRAMBank8K = function(srcBank, dstBank) {
  return this.mapCHRRAMBank4K(srcBank, dstBank, 8);
};

AbstractMapper.prototype.mapCHRRAMBank4K = function(srcBank, dstBank, ratio) {
  var i, j, maxBank, ref;
  if (ratio == null) {
    ratio = 4;
  }
  srcBank = ratio * srcBank;
  dstBank = ratio * dstBank;
  maxBank = (this.chrRAMSize - 1) >> 10;
  for (i = j = 0, ref = ratio; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
    this.ppuMemory.mapPatternsBank(srcBank + i, (dstBank + i) & maxBank);
  }
  return void 0;
};

AbstractMapper.prototype.printCHRRAMInfo = function() {
  logger.info("==========[Mapper CHR RAM Info - Start]==========");
  logger.info("has CHR RAM           : " + this.hasCHRRAM);
  logger.info("has CHR RAM battery   : " + this.hasCHRRAMBattery);
  logger.info("CHR RAM size          : " + (readableSize(this.chrRAMSize)));
  logger.info("CHR RAM size (battery): " + (readableSize(this.chrRAMSizeBattery)));
  return logger.info("==========[Mapper CHR RAM Info - End]==========");
};

AbstractMapper.prototype.setSingleScreenMirroring = function(area) {
  if (area == null) {
    area = 0;
  }
  return this.ppuMemory.setNamesAttrsMirroring(Mirroring.getSingleScreen(area));
};

AbstractMapper.prototype.setVerticalMirroring = function() {
  return this.ppuMemory.setNamesAttrsMirroring(Mirroring.VERTICAL);
};

AbstractMapper.prototype.setHorizontalMirroring = function() {
  return this.ppuMemory.setNamesAttrsMirroring(Mirroring.HORIZONTAL);
};

AbstractMapper.prototype.setFourScreenMirroring = function() {
  return this.ppuMemory.setNamesAttrsMirroring(Mirroring.FOUR_SCREEN);
};

AbstractMapper.prototype.setMirroring = function(area0, area1, area2, area3) {
  return this.ppuMemory.mapNamesAttrsAreas(area0, area1, area2, area3);
};

module.exports = AbstractMapper;
