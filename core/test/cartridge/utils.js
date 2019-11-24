import {Region, Mirroring} from '../../src/common';

export function createINes({prgRomUnits = 1, prgRamUnits = 0, chrRomUnits = 1,
                            hasPrgRamBattery = false, hasTrainer = false,
                            verticalMirroring = false, fourScreenMode = false,
                            palRegion = false, mapperId = 0,
                            nes2DetectionBits = 0} = {}) {
  const header = [
    0x4E, 0x45, 0x53, 0x1A,
    prgRomUnits & 0xFF,
    chrRomUnits & 0xFF,
    ((mapperId << 4) & 0xF0) | (fourScreenMode << 3) | (hasTrainer << 2) | (hasPrgRamBattery << 1) | (verticalMirroring << 0),
    (mapperId & 0xF0) | (nes2DetectionBits << 2),
    prgRamUnits & 0xFF,
    palRegion & 0x01,
    0, 0, 0, 0, 0, 0,
  ];

  const trainer = new Uint8Array(hasTrainer ? 512 : 0).fill(0);
  const prgRom = new Uint8Array(prgRomUnits * 0x4000).fill(1);
  const chrRom = new Uint8Array(chrRomUnits * 0x2000).fill(2);

  return new Uint8Array([...header, ...trainer, ...prgRom, ...chrRom]);
}

export function createNes2({prgRomUnits = 1, prgRamUnits = 0, prgRamUnitsBattery = 0,
                            chrRomUnits = 1, chrRamUnits = 0, chrRamUnitsBattery = 0,
                            hasPrgRamBattery = false, hasTrainer = false,
                            verticalMirroring = false, fourScreenMode = false, palRegion = false,
                            mapperId = 0, submapperId = 0} = {}) {
  const header = [
    0x4E, 0x45, 0x53, 0x1A,
    prgRomUnits & 0xFF,
    chrRomUnits & 0xFF,
    ((mapperId << 4) & 0xF0) | (fourScreenMode << 3) | (hasTrainer << 2) | (hasPrgRamBattery << 1) | (verticalMirroring << 0),
    (mapperId & 0xF0) | 0x08,
    ((submapperId << 4) & 0xF0) | ((mapperId >>> 8) & 0x0F),
    ((chrRomUnits >>> 4) & 0xF0) | ((prgRomUnits >>> 8) & 0x0F),
    ((prgRamUnitsBattery << 4) & 0xF0) | (prgRamUnits & 0x0F),
    ((chrRamUnitsBattery << 4) & 0xF0) | (chrRamUnits & 0x0F),
    palRegion & 0x01,
    0, 0, 0,
  ];

  const trainer = new Uint8Array(hasTrainer ? 512 : 0).fill(0);
  const prgRom = new Uint8Array(prgRomUnits * 0x4000).fill(1);
  const chrRom = new Uint8Array(chrRomUnits * 0x2000).fill(2);

  return new Uint8Array([...header, ...trainer, ...prgRom, ...chrRom]);
}

export function createCartridge({sha1, mapper = 'NROM', submapper,
                                 region = Region.NTSC, mirroring = Mirroring.HORIZONTAL,
                                 prgRomSize = 0x4000, prgRamSize = 0, prgRamSizeBattery = 0,
                                 chrRomSize = 0, chrRamSize = 0, chrRamSizeBattery = 0} = {}) {
  const prgRom = new Uint8Array(prgRomSize);
  const chrRom = new Uint8Array(prgRomSize);

  return {
    sha1, mapper, submapper, region, mirroring,
    prgRom, prgRomSize, prgRamSize, prgRamSizeBattery,
    chrRom, chrRomSize, chrRamSize, chrRamSizeBattery,
  };
}
