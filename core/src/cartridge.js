import {formatSize} from './utils/format';
import {Mirroring, Region} from './enums';
import inesParser from './parsers/inesParser';
import logger from './utils/logger';

const parsers = [inesParser];

export function readCartridge(path, libs) {
  logger.info(`Reading cartridge from file "${path}"`);
  const buffer = require('fs').readFileSync(path); // eslint-disable-line import/newline-after-import
  return createCartridge(new Uint8Array(buffer), libs);
}

export function createCartridge(data, {JSZip, sha1} = {}) {
  logger.info('Creating cartridge');

  if (data instanceof Array || data instanceof ArrayBuffer) {
    data = new Uint8Array(data);
  } else if (!(data instanceof Uint8Array)) {
    throw new Error('Unsupported data type');
  }

  if (hasZipSignature(data)) {
    data = unzip(data, JSZip);
  }

  for (const parser of parsers) {
    if (parser.supports(data)) {
      logger.info(`Using "${parser.name}" parser`);
      const cartridge = parser.parse(data);
      computeSHA1(cartridge, sha1);
      printInfo(cartridge);
      return cartridge;
    }
  }

  throw new Error('Unsupported data format.');
}

function hasZipSignature(data) {
  return data[0] === 0x50
      && data[1] === 0x4B
      && data[2] === 0x03
      && data[3] === 0x04;
}

function unzip(data, JSZip) {
  logger.info('Unzipping ROM image');
  if (JSZip == null) {
    throw new Error('Unable to unzip ROM image: JSZip is not available.');
  }
  const files = new JSZip(data).file(/^.*\.nes$/i);
  if (files.length === 0) {
    throw new Error('ZIP does not contain ".nes" ROM image');
  }
  return files[0].asUint8Array();
}

function computeSHA1(cartridge, sha1) {
  if (sha1) {
    logger.info('Computing SHA-1');
    const buffer = new Uint8Array(cartridge.prgROMSize + cartridge.chrROMSize);
    buffer.set(cartridge.prgROM);
    buffer.set(cartridge.chrROM, cartridge.prgROMSize);
    cartridge.sha1 = sha1(buffer);
  }
}

function printInfo(cartridge) {
  logger.info('==========[Cartridge Info - Start]==========');
  logger.info('SHA-1                 : ' + cartridge.sha1);
  logger.info('Mapper                : ' + cartridge.mapper);
  logger.info('Submapper             : ' + cartridge.submapper);
  logger.info('Region                : ' + Region.toString(cartridge.region));
  logger.info('Mirroring             : ' + Mirroring.toString(cartridge.mirroring));
  logger.info('PRG ROM size          : ' + formatSize(cartridge.prgROMSize));
  logger.info('PRG RAM size          : ' + formatSize(cartridge.prgRAMSize));
  logger.info('PRG RAM size (battery): ' + formatSize(cartridge.prgRAMSizeBattery));
  logger.info('CHR ROM size          : ' + formatSize(cartridge.chrROMSize));
  logger.info('CHR RAM size          : ' + formatSize(cartridge.chrRAMSize));
  logger.info('CHR RAM size (battery): ' + formatSize(cartridge.chrRAMSizeBattery));
  logger.info('==========[Cartridge Info - End]==========');
}
