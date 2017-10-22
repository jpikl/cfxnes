import {Region, Mirroring} from '../../src/common';

export function createINES({prgROMUnits = 1, prgRAMUnits = 0, chrROMUnits = 1,
                            hasPRGRAMBattery = false, hasTrainer = false,
                            verticalMirroring = false, fourScreenMode = false,
                            palRegion = false, mapperId = 0,
                            nes2DetectionBits = 0} = {}) {
  const header = [
    0x4E, 0x45, 0x53, 0x1A,
    prgROMUnits & 0xFF,
    chrROMUnits & 0xFF,
    ((mapperId << 4) & 0xF0) | (fourScreenMode << 3) | (hasTrainer << 2) | (hasPRGRAMBattery << 1) | (verticalMirroring << 0),
    (mapperId & 0xF0) | (nes2DetectionBits << 2),
    prgRAMUnits & 0xFF,
    palRegion & 0x01,
    0, 0, 0, 0, 0, 0,
  ];

  const trainer = new Uint8Array(hasTrainer ? 512 : 0).fill(0);
  const prgROM = new Uint8Array(prgROMUnits * 0x4000).fill(1);
  const chrROM = new Uint8Array(chrROMUnits * 0x2000).fill(2);

  return new Uint8Array([...header, ...trainer, ...prgROM, ...chrROM]);
}

export function createNES2({prgROMUnits = 1, prgRAMUnits = 0, prgRAMUnitsBattery = 0,
                            chrROMUnits = 1, chrRAMUnits = 0, chrRAMUnitsBattery = 0,
                            hasPRGRAMBattery = false, hasTrainer = false,
                            verticalMirroring = false, fourScreenMode = false, palRegion = false,
                            mapperId = 0, submapperId = 0} = {}) {
  const header = [
    0x4E, 0x45, 0x53, 0x1A,
    prgROMUnits & 0xFF,
    chrROMUnits & 0xFF,
    ((mapperId << 4) & 0xF0) | (fourScreenMode << 3) | (hasTrainer << 2) | (hasPRGRAMBattery << 1) | (verticalMirroring << 0),
    (mapperId & 0xF0) | 0x08,
    ((submapperId << 4) & 0xF0) | ((mapperId >>> 8) & 0x0F),
    ((chrROMUnits >>> 4) & 0xF0) | ((prgROMUnits >>> 8) & 0x0F),
    ((prgRAMUnitsBattery << 4) & 0xF0) | (prgRAMUnits & 0x0F),
    ((chrRAMUnitsBattery << 4) & 0xF0) | (chrRAMUnits & 0x0F),
    palRegion & 0x01,
    0, 0, 0,
  ];

  const trainer = new Uint8Array(hasTrainer ? 512 : 0).fill(0);
  const prgROM = new Uint8Array(prgROMUnits * 0x4000).fill(1);
  const chrROM = new Uint8Array(chrROMUnits * 0x2000).fill(2);

  return new Uint8Array([...header, ...trainer, ...prgROM, ...chrROM]);
}

export function createCartridge({sha1, mapper = 'NROM', submapper,
                                 region = Region.NTSC, mirroring = Mirroring.HORIZONTAL,
                                 prgROMSize = 0x4000, prgRAMSize = 0, prgRAMSizeBattery = 0,
                                 chrROMSize = 0, chrRAMSize = 0, chrRAMSizeBattery = 0} = {}) {
  const prgROM = new Uint8Array(prgROMSize);
  const chrROM = new Uint8Array(prgROMSize);

  return {
    sha1, mapper, submapper, region, mirroring,
    prgROM, prgROMSize, prgRAMSize, prgRAMSizeBattery,
    chrROM, chrROMSize, chrRAMSize, chrRAMSizeBattery,
  };
}
