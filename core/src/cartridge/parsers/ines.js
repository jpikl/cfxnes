import {log, Region, Mirroring, MapperType, SubmapperType, formatSize} from '../../common';

export const name = 'iNES / NES 2.0';

const mappers = {
  0: MapperType.NROM,
  1: MapperType.MMC1,
  2: MapperType.UNROM,
  3: MapperType.CNROM,
  4: MapperType.MMC3,
  7: MapperType.AOROM,
  11: MapperType.COLOR_DREAMS,
  34: MapperType.BNROM, // NINA-001 uses the same ID
};

const submappers = {
  [joinMapperIds(1, 1)]: SubmapperType.SUROM, // MMC1 submapper
  [joinMapperIds(1, 2)]: SubmapperType.SOROM, // MMC1 submapper
  [joinMapperIds(1, 3)]: SubmapperType.SXROM, // MMC1 submapper
};

function joinMapperIds(mapperId, submapperId) {
  return (mapperId << 4) | submapperId;
}

export function supports(data) {
  return data[0] === 0x4E
      && data[1] === 0x45
      && data[2] === 0x53
      && data[3] === 0x1A; // 'NES^Z' signature
}

export function parse(data) {
  if (!supports(data)) {
    throw new Error('Incorrect signature');
  }
  if (data.length < 16) {
    throw new Error('Input is too short: expected at least 16 B but got ' + formatSize(data.length));
  }

  let version;
  let prgRomUnits = data[4];
  let chrRomUnits = data[5];
  let region, mirroring;
  let mapperId = (data[7] & 0xF0) | (data[6] >>> 4);
  let submapperId;
  let prgRamSize, prgRamSizeBattery;
  let chrRamSize, chrRamSizeBattery;

  if (data[6] & 0x08) {
    mirroring = Mirroring.FOUR_SCREEN;
  } else if (data[6] & 0x01) {
    mirroring = Mirroring.VERTICAL;
  } else {
    mirroring = Mirroring.HORIZONTAL;
  }

  if ((data[7] & 0x0C) === 0x08) {
    log.info('Detected NES 2.0 format');
    version = 2;
    mapperId |= (data[8] & 0x0F) << 8; // Extra 4 bits for mapper
    submapperId = (data[8] & 0xF0) >>> 4;
    prgRomUnits |= (data[9] & 0x0F) << 8; // Extra 4 bits for PRG ROM size
    chrRomUnits |= (data[9] & 0xF0) << 4; // Extra 4 bits for CHR ROM size
    prgRamSizeBattery = computeExpSize((data[10] & 0xF0) >>> 4);
    chrRamSizeBattery = computeExpSize((data[11] & 0xF0) >>> 4);
    prgRamSize = prgRamSizeBattery + computeExpSize(data[10] & 0x0F);
    chrRamSize = chrRamSizeBattery + computeExpSize(data[11] & 0x0F);
    region = data[12] & 0x01 ? Region.PAL : Region.NTSC;
  } else {
    log.info('Detected iNES format');
    version = 1;
    prgRamSize = (data[8] || 1) * 0x2000; // N x 8KB (at least 1 unit - iNES format backward compatibility)
    prgRamSizeBattery = data[6] & 0x02 ? prgRamSize : 0;
    chrRamSize = chrRomUnits ? 0 : 0x2000; // Exclusive with CHR ROM
    chrRamSizeBattery = 0;
    region = data[9] & 0x01 ? Region.PAL : Region.NTSC;
  }

  if (prgRomUnits === 0) {
    throw new Error('Invalid header: 0 PRG ROM units');
  }

  const prgRomStart = 16 + (data[6] & 0x04 ? 512 : 0); // Skip optional 512B trainer
  const prgRomSize = prgRomUnits * 0x4000; // N x 16KB
  const prgRomEnd = prgRomStart + prgRomSize;

  const chrRomStart = prgRomEnd;
  const chrRomSize = chrRomUnits * 0x2000; // N x 8KB
  const chrRomEnd = chrRomStart + chrRomSize;

  let mapper = mappers[mapperId] || mapperId.toString();
  if (mapper === MapperType.BNROM && chrRomSize > 0) {
    mapper = MapperType.NINA_001; // Uses the same ID as BNROM, but has CHR ROM instead of CHR RAM
  }

  const submapper = submappers[joinMapperIds(mapperId, submapperId)];

  if (data.length < chrRomEnd) {
    throw new Error(`Input is too short: expected at least ${formatSize(chrRomEnd)} but got ${formatSize(data.length)}`);
  }

  const prgRom = data.subarray(prgRomStart, prgRomEnd);
  const chrRom = chrRomSize ? data.subarray(chrRomStart, chrRomEnd) : undefined;

  return {
    version, mirroring, region, mapper, submapper,
    prgRomSize, prgRom, prgRamSize, prgRamSizeBattery,
    chrRomSize, chrRom, chrRamSize, chrRamSizeBattery,
  };
}

function computeExpSize(value) {
  if (value > 0) {
    return Math.pow(2, value - 1) * 0x80; // grows exponentially: 128B, 256B, 512B, ...
  }
  return 0;
}
