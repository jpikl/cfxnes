import Mirroring from '../common/Mirroring';
import logger from '../utils/logger';
import {zeroArray, copyArray} from '../utils/arrays';
import {newByteArray, newUintArray} from '../utils/system';

const POWER_UP_PALETTES = [
  0x09, 0x01, 0x00, 0x01, 0x00, 0x02, 0x02, 0x0D,
  0x08, 0x10, 0x08, 0x24, 0x00, 0x00, 0x04, 0x2C,
  0x09, 0x01, 0x34, 0x03, 0x00, 0x04, 0x00, 0x14,
  0x08, 0x3A, 0x00, 0x02, 0x00, 0x20, 0x2C, 0x08,
];

//=========================================================
// PPU memory
//=========================================================

export default class PPUMemory {

  constructor() {
    this.initPatterns();
    this.initNamesAttrs();
    this.initPalettes();
  }

  //=========================================================
  // Power-up state initialization
  //=========================================================

  powerUp() {
    logger.info('Reseting PPU memory');
    this.resetPatterns();
    this.resetNamesAttrs();
    this.resetPaletts();
  }

  //=========================================================
  // PPU memory access
  //=========================================================

  read(address) {
    if (address < 0x2000) {
      return this.readPattern(address);  // $0000-$1FFF
    } else if (address < 0x3F00) {
      return this.readNameAttr(address); // $2000-$3EFF
    } else {
      return this.readPalette(address);  // $3F00-$3FFF
    }
  }

  write(address, value) {
    address = this.mapAddress(address);
    if (address < 0x2000) {
      this.writePattern(address, value);  // $0000-$1FFF
    } else if (address < 0x3F00) {
      this.writeNameAttr(address, value); // $2000-$3EFF
    } else {
      this.writePalette(address, value);  // $3F00-$3FFF
    }
  }

  mapAddress(address) {
    return address & 0x3FFF;
  }

  //=========================================================
  // Patterns access ($0000-$1FFF)
  //=========================================================

  initPatterns() {
    this.patternsMapping = newUintArray(8);
  }

  remapPatterns(mapper) {
    if (mapper.hasCHRRAM) {
      this.patterns = mapper.chrRAM;
      this.canWritePattern = true;
    } else {
      this.patterns = mapper.chrROM;
      this.canWritePattern = false;
    }
  }

  resetPatterns() {
    zeroArray(this.patternsMapping);
  }

  readPattern(address) {
    return this.patterns[this.mapPatternAddress(address)];
  }

  writePattern(address, value) {
    if (this.canWritePattern) {
      this.patterns[this.mapPatternAddress(address)] = value;
    }
  }

  mapPatternAddress(address) {
    return this.patternsMapping[(address & 0x1C00) >>> 10] | address & 0x03FF;
  }

  mapPatternsBank(srcBank, dstBank) {
    this.patternsMapping[srcBank] = dstBank * 0x0400; // 1K bank
  }

  //=========================================================
  // Names/attributes access ($2000-$3EFF)
  //=========================================================

  initNamesAttrs() {
    this.namesAttrs = newByteArray(0x1000); // Up to 4KB
    this.namesAttrsMapping = newUintArray(4);
  }

  remapNamesAttrs(mapper) {
    this.defaultMirroring = mapper.mirroring;
  }

  resetNamesAttrs() {
    zeroArray(this.namesAttrs);
    this.setNamesAttrsMirroring(this.defaultMirroring);
  }

  readNameAttr(address) {
    return this.namesAttrs[this.mapNameAttrAddres(address)];
  }

  writeNameAttr(address, value) {
    this.namesAttrs[this.mapNameAttrAddres(address)] = value;
  }

  mapNameAttrAddres(address) {
    return this.namesAttrsMapping[(address & 0x0C00) >>> 10] | address & 0x03FF;
  }

  mapNamesAttrsAreas(areas) {
    for (var i = 0; i < 4; i++) {
      this.namesAttrsMapping[i] = areas[i] * 0x0400;
    }
  }

  setNamesAttrsMirroring(mirroring) {
    this.mapNamesAttrsAreas(Mirroring.getParams(mirroring).areas);
  }

  //=========================================================
  // Palettes access ($3F00-$3FFF)
  //=========================================================

  initPalettes() {
    this.paletts = newByteArray(0x20); // 2 * 16B palette (background / sprites)
  }

  resetPaletts() {
    copyArray(POWER_UP_PALETTES, this.paletts);
  }

  readPalette(address) {
    return this.paletts[this.mapPaletteAddress(address)];
  }

  writePalette(address, value) {
    this.paletts[this.mapPaletteAddress(address)] = value;
  }

  mapPaletteAddress(address) {
    if (address & 0x0003) {
      return address & 0x001F; // Mirroring of [$3F00-$3F1F] in [$3F00-$3FFF]
    } else {
      return address & 0x000F; // $3F10/$3F14/$3F18/$3F1C are mirrorors of $3F00/$3F04/$3F08$/3F0C
    }
  }

  //=========================================================
  // Mapper connection
  //=========================================================

  connectMapper(mapper) {
    this.remapPatterns(mapper);
    this.remapNamesAttrs(mapper);
  }

}
