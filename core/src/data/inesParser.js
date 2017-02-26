import Mirroring from '../common/Mirroring';
import Region from '../common/Region';
import log from '../common/log';
import {formatSize} from '../common/utils';

const name = 'iNES / NES 2.0';

const mappers = {
  0: 'NROM',
  1: 'MMC1',
  2: 'UNROM',
  3: 'CNROM',
  4: 'MMC3',
  7: 'AOROM',
  11: 'ColorDreams',
  34: 'BNROM', // NINA-001 uses the same ID
};

const submappers = {
  'MMC1_1': 'SUROM',
  'MMC1_2': 'SOROM',
  'MMC1_3': 'SXROM',
};

function supports(data) {
  return data[0] === 0x4E
      && data[1] === 0x45
      && data[2] === 0x53
      && data[3] === 0x1A; // 'NES^Z' signature
}

function parse(data) {
  if (!supports(data)) {
    throw new Error('Incorrect signature');
  }
  if (data.length < 16) {
    throw new Error('Input is too short: expected at least 16 B but got ' + formatSize(data.length));
  }

  let prgROMUnits = data[4];
  let chrROMUnits = data[5];
  let region, mirroring;
  let mapperId = (data[7] & 0xF0) | (data[6] >>> 4);
  let submapperId;
  let prgRAMSize, prgRAMSizeBattery;
  let chrRAMSize, chrRAMSizeBattery;

  if (data[6] & 0x08) {
    mirroring = Mirroring.FOUR_SCREEN;
  } else if (data[6] & 0x01) {
    mirroring = Mirroring.VERTICAL;
  } else {
    mirroring = Mirroring.HORIZONTAL;
  }

  if (data[7] & 0x08) {
    log.info('Detected NES 2.0 format');
    mapperId |= (data[8] & 0x0F) << 8; // Extra 4 bits for mapper
    submapperId = (data[8] & 0xF0) >>> 4;
    prgROMUnits |= (data[9] & 0x0F) << 8; // Extra 4 bits for PRG ROM size
    chrROMUnits |= (data[9] & 0xF0) << 4; // Extra 4 bits for CHR ROM size
    prgRAMSizeBattery = computeExpSize((data[10] & 0xF0) >>> 4);
    chrRAMSizeBattery = computeExpSize((data[11] & 0xF0) >>> 4);
    prgRAMSize = prgRAMSizeBattery + computeExpSize(data[10] & 0x0F);
    chrRAMSize = chrRAMSizeBattery + computeExpSize(data[11] & 0x0F);
    region = data[12] & 0x01 ? Region.PAL : Region.NTSC;
  } else {
    log.info('Detected iNES format');
    prgRAMSize = (data[8] || 1) * 0x2000; // N x 8KB (at least 1 unit - iNES format backward compatibility)
    prgRAMSizeBattery = data[6] & 0x02 ? prgRAMSize : 0;
    chrRAMSize = chrROMUnits ? 0 : 0x2000; // Exclusive with CHR ROM
    chrRAMSizeBattery = 0;
    region = data[9] & 0x01 ? Region.PAL : Region.NTSC;
  }

  if (prgROMUnits === 0) {
    throw new Error('Invalid header: 0 PRG ROM units');
  }

  const prgROMStart = 16 + (data[6] & 0x04 ? 512 : 0); // Skip optional 512B trainer
  const prgROMSize = prgROMUnits * 0x4000; // N x 16KB
  const prgROMEnd = prgROMStart + prgROMSize;

  const chrROMStart = prgROMEnd;
  const chrROMSize = chrROMUnits * 0x2000; // N x 8KB
  const chrROMEnd = chrROMStart + chrROMSize;

  let mapper = mappers[mapperId] || mapperId.toString();
  if (mapper === 'BNROM' && chrROMSize > 0) {
    mapper = 'NINA-001'; // Uses the same ID as BNROM, but has CHR ROM instead of CHR RAM
  }

  const submapper = submappers[mapper + '_' + submapperId];

  if (data.length < chrROMEnd) {
    throw new Error(`Input is too short: expected at least ${formatSize(chrROMEnd)} but got ${formatSize(data.length)}`);
  }

  const prgROM = data.subarray(prgROMStart, prgROMEnd);
  const chrROM = chrROMSize ? data.subarray(chrROMStart, chrROMEnd) : undefined;

  return {
    mirroring, region, mapper, submapper,
    prgROMSize, prgROM, prgRAMSize, prgRAMSizeBattery,
    chrROMSize, chrROM, chrRAMSize, chrRAMSizeBattery,
  };
}

function computeExpSize(value) {
  if (value > 0) {
    return Math.pow(2, value - 1) * 0x80; // grows exponentially: 128B, 256B, 512B, ...
  }
  return 0;
}

export default {name, supports, parse};
