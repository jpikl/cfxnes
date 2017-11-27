import {log, Mirroring} from '../common';

const INITIAL_PALETTES = [
  0x09, 0x01, 0x00, 0x01, 0x00, 0x02, 0x02, 0x0D, // Background palettes 0, 1
  0x08, 0x10, 0x08, 0x24, 0x00, 0x00, 0x04, 0x2C, // Background palettes 2, 3
  0x09, 0x01, 0x34, 0x03, 0x00, 0x04, 0x00, 0x14, // Sprite palettes 0, 1
  0x08, 0x3A, 0x00, 0x02, 0x00, 0x20, 0x2C, 0x08, // Sprite palettes 2, 3
];

// $10000 +----------------------------------------------------------+ $10000
//        |                                                          |
//        |                  Mirrors of $0000-$3FFF                  |
//        |                                                          |
//  $4000 +----------------------------------------------------------+ $4000
//        |                  Mirrors of $3F00-$3F1F                  |
//  $3F20 +----------------------------------+-----------------------+ $3F20
//        |         Sprite palettes (4)      |                       |
//  $3F10 +----------------------------------+  Palette RAM indexes  |
//        |       Background palettes (4)    |                       |
//  $3F00 +----------------------------------+-----------------------+ $3F00 (Universal background color)
//        |                  Mirrors of $2000-$2EFF                  |
//  $3000 +-------------------+--------------+-----------------------+ $3000
//        | Attribute table 3 |              |                       |
//  $2FC0 +-------------------+  Nametable 3 |                       |
//        |                                  |                       |
//  $2C00 +-------------------+--------------+                       |
//        | Attribute table 2 |              |                       |
//  $2BC0 +-------------------+  Nametable 2 |      Nametables       |
//        |                                  |                       |
//  $2800 +-------------------+--------------+   (2 KB on board      |
//        | Attribute table 1 |              |   + additional 2 KB   |
//  $27C0 +-------------------+  Nametable 1 |  on some cartridges)  |
//        |                                  |                       |
//  $2400 +-------------------+--------------+                       |
//        | Attribute table 0 |              |                       |
//  $23C0 +-------------------+  Nametable 0 |                       |
//        |                                  |                       |
//  $2000 +----------------------------------+-----------------------+ $2000
//        |         Pattern table 1          |                       |
//  $1000 +----------------------------------+   CHR RAM/ROM (8 KB)  |
//        |         Pattern table 0          |                       |
//  $0000 +----------------------------------+-----------------------+ $0000

export default class PPUMemory {

  //=========================================================
  // Initialization
  //=========================================================

  constructor() {
    log.info('Initializing PPU memory');

    this.patterns = null; // Pattern tables (will be loaded from mapper)
    this.patternsMapping = new Uint32Array(8); // Base addresses of each 1K pattern bank
    this.canWritePattern = false; // Pattern write protection
    this.nametables = new Uint8Array(0x1000); // Nametables (2 KB on board + additional 2 KB on some cartridges)
    this.nametablesMapping = new Uint32Array(4); // Base address of each nametable
    this.palettes = new Uint8Array(0x20); // 8 x 4B palettes (background / sprite)

    this.mapper = null;
  }

  setMapper(mapper) {
    this.mapper = mapper;
    this.patterns = mapper && (mapper.chrRAM || mapper.chrROM);
    this.canWritePattern = mapper != null && mapper.chrRAM != null;
  }

  //=========================================================
  // Reset
  //=========================================================

  reset() {
    log.info('Resetting PPU memory');
    this.resetPatterns();
    this.resetNametables();
    this.resetPalettes();
  }

  //=========================================================
  // Memory access
  //=========================================================

  read(address) {
    address = this.mapAddress(address);
    if (address < 0x2000) {
      return this.readPattern(address);   // $0000-$1FFF
    } else if (address < 0x3F00) {
      return this.readNametable(address); // $2000-$3EFF
    }
    return this.readPalette(address);     // $3F00-$3FFF
  }

  write(address, value) {
    address = this.mapAddress(address);
    if (address < 0x2000) {
      this.writePattern(address, value);   // $0000-$1FFF
    } else if (address < 0x3F00) {
      this.writeNametable(address, value); // $2000-$3EFF
    } else {
      this.writePalette(address, value);   // $3F00-$3FFF
    }
  }

  mapAddress(address) {
    return address & 0x3FFF; // Mirroring of $0000-$3FFF in $4000-$FFFF
  }

  //=========================================================
  // CHR RAM/ROM ($0000-$1FFF)
  //=========================================================

  resetPatterns() {
    this.patternsMapping.fill(0);
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
    return this.patternsMapping[(address & 0x1C00) >>> 10] | (address & 0x03FF);
  }

  mapPatternsBank(srcBank, dstBank) {
    this.patternsMapping[srcBank] = dstBank * 0x0400; // 1 KB bank
  }

  //=========================================================
  // Nametables ($2000-$3EFF)
  //=========================================================

  resetNametables() {
    this.nametables.fill(0);
    this.setNametablesMirroring((this.mapper && this.mapper.mirroring) || Mirroring.SCREEN_0);
  }

  readNametable(address) {
    return this.nametables[this.mapNametableAddress(address)];
  }

  writeNametable(address, value) {
    this.nametables[this.mapNametableAddress(address)] = value;
  }

  mapNametableAddress(address) {
    return this.nametablesMapping[(address & 0x0C00) >>> 10] | (address & 0x03FF);
  }

  setNametablesMirroring(mirroring) {
    const areas = Mirroring.getAreas(mirroring);
    for (let i = 0; i < 4; i++) {
      this.nametablesMapping[i] = areas[i] * 0x0400;
    }
  }

  //=========================================================
  // Palette RAM indexes ($3F00-$3FFF)
  //=========================================================

  resetPalettes() {
    this.palettes.set(INITIAL_PALETTES);
  }

  readPalette(address) {
    return this.palettes[this.mapPaletteAddress(address)];
  }

  writePalette(address, value) {
    this.palettes[this.mapPaletteAddress(address)] = value;
  }

  mapPaletteAddress(address) {
    if (address & 0x0003) {
      return address & 0x001F; // Mirroring of $3F00-$3F1F in $3F00-$3FFF
    }
    return address & 0x000F; // $3F1{0,4,8,C} are mirrors of $3F0{0,4,8,C}
  }

}
