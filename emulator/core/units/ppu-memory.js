import { Mirroring }     from "../common/types";
import { logger }        from "../utils/logger";
import { newUint8Array } from "../utils/system";

const POWER_UP_PALETTES = [0x09, 0x01, 0x00, 0x01, 0x00, 0x02, 0x02, 0x0D, 0x08, 0x10, 0x08, 0x24, 0x00, 0x00, 0x04, 0x2C, 0x09, 0x01, 0x34, 0x03, 0x00, 0x04, 0x00, 0x14, 0x08, 0x3A, 0x00, 0x02, 0x00, 0x20, 0x2C, 0x08];

export function PPUMemory() {}

PPUMemory.prototype.powerUp = function() {
  logger.info("Reseting PPU memory");
  this.createNamesAttrs();
  return this.createPaletts();
};

PPUMemory.prototype.read = function(address) {
  address = this.mapAddress(address);
  if (address < 0x2000) {
    return this.readPattern(address);
  } else if (address < 0x3F00) {
    return this.readNameAttr(address);
  } else {
    return this.readPalette(address);
  }
};

PPUMemory.prototype.write = function(address, value) {
  address = this.mapAddress(address);
  if (address < 0x2000) {
    return this.writePattern(address, value);
  } else if (address < 0x3F00) {
    return this.writeNameAttr(address, value);
  } else {
    return this.writePalette(address, value);
  }
};

PPUMemory.prototype.mapAddress = function(address) {
  return address & 0x3FFF;
};

PPUMemory.prototype.resetPatterns = function(mapper) {
  if (mapper.chrRAM) {
    this.patterns = mapper.chrRAM;
    this.canWritePattern = true;
  } else {
    this.patterns = mapper.chrROM;
    this.canWritePattern = false;
  }
  return this.chrMapping = [];
};

PPUMemory.prototype.readPattern = function(address) {
  return this.patterns[this.mapPatternAddress(address)];
};

PPUMemory.prototype.writePattern = function(address, value) {
  if (this.canWritePattern) {
    return this.patterns[this.mapPatternAddress(address)] = value;
  } else {
    return value;
  }
};

PPUMemory.prototype.mapPatternAddress = function(address) {
  return this.chrMapping[address & 0x1C00] | address & 0x03FF;
};

PPUMemory.prototype.mapPatternsBank = function(srcBank, dstBank) {
  return this.chrMapping[srcBank * 0x0400] = dstBank * 0x0400;
};

PPUMemory.prototype.createNamesAttrs = function() {
  this.namesAttrs = newUint8Array(0x1000);
  return void 0;
};

PPUMemory.prototype.resetNamesAttrs = function(mapper) {
  return this.setNamesAttrsMirroring(mapper.mirroring);
};

PPUMemory.prototype.readNameAttr = function(address) {
  return this.namesAttrs[this.mapNameAttrAddres(address)];
};

PPUMemory.prototype.writeNameAttr = function(address, value) {
  return this.namesAttrs[this.mapNameAttrAddres(address)] = value;
};

PPUMemory.prototype.mapNameAttrAddres = function(address) {
  return this.namesAttrsMapping[address & 0x0C00] | address & 0x03FF;
};

PPUMemory.prototype.mapNamesAttrsAreas = function(area0, area1, area2, area3) {
  if (this.namesAttrsMapping == null) {
    this.namesAttrsMapping = [];
  }
  this.namesAttrsMapping[0x0000] = area0 * 0x0400;
  this.namesAttrsMapping[0x0400] = area1 * 0x0400;
  this.namesAttrsMapping[0x0800] = area2 * 0x0400;
  return this.namesAttrsMapping[0x0C00] = area3 * 0x0400;
};

PPUMemory.prototype.setNamesAttrsMirroring = function(mirroring) {
  switch (mirroring) {
    case Mirroring.SINGLE_SCREEN_0:
      return this.mapNamesAttrsAreas(0, 0, 0, 0);
    case Mirroring.SINGLE_SCREEN_1:
      return this.mapNamesAttrsAreas(1, 1, 1, 1);
    case Mirroring.SINGLE_SCREEN_2:
      return this.mapNamesAttrsAreas(2, 2, 2, 2);
    case Mirroring.SINGLE_SCREEN_3:
      return this.mapNamesAttrsAreas(3, 3, 3, 3);
    case Mirroring.HORIZONTAL:
      return this.mapNamesAttrsAreas(0, 0, 1, 1);
    case Mirroring.VERTICAL:
      return this.mapNamesAttrsAreas(0, 1, 0, 1);
    case Mirroring.FOUR_SCREEN:
      return this.mapNamesAttrsAreas(0, 1, 2, 3);
    default:
      throw new Error("Undefined mirroring (" + mirroring + ")");
  }
};

PPUMemory.prototype.createPaletts = function() {
  var i, j, ref;
  this.paletts = newUint8Array(0x20);
  for (i = j = 0, ref = this.paletts.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
    this.paletts[i] = POWER_UP_PALETTES[i];
  }
  return void 0;
};

PPUMemory.prototype.readPalette = function(address) {
  return this.paletts[this.mapPaletteAddress(address)];
};

PPUMemory.prototype.writePalette = function(address, value) {
  return this.paletts[this.mapPaletteAddress(address)] = value;
};

PPUMemory.prototype.mapPaletteAddress = function(address) {
  if (address & 0x0003) {
    return address & 0x001F;
  } else {
    return address & 0x000F;
  }
};

PPUMemory.prototype.connectMapper = function(mapper) {
  this.resetPatterns(mapper);
  return this.resetNamesAttrs(mapper);
};
