import {formatSize} from './utils';
import inesParser from './parsers/inesParser';
import log from './log';

const parsers = [inesParser];

export function readCartridge(path, libs) {
  log.info(`Reading cartridge from file "${path}"`);
  const data = require('fs').readFileSync(path); // eslint-disable-line import/newline-after-import
  return createCartridge(new Uint8Array(data), libs);
}

export function createCartridge(data, {JSZip, sha1} = {}) {
  log.info('Creating cartridge from array');

  if (data instanceof Array || data instanceof ArrayBuffer) {
    data = new Uint8Array(data);
  } else if (!(data instanceof Uint8Array)) {
    throw new Error('Unsupported data type');
  }

  if (hasZipSignature(data)) {
    data = unzip(data, JSZip);
  }

  log.info(`Parsing ${formatSize(data.length)} of data`);
  for (const parser of parsers) {
    if (parser.supports(data)) {
      log.info(`Using "${parser.name}" parser`);
      const cartridge = parser.parse(data);
      computeSHA1(cartridge, sha1);
      printInfo(cartridge);
      return cartridge;
    }
  }

  throw new Error('Unsupported data format');
}

function hasZipSignature(data) {
  return data[0] === 0x50
      && data[1] === 0x4B
      && data[2] === 0x03
      && data[3] === 0x04;
}

function unzip(data, JSZip) {
  log.info(`Extracting ROM image from ${formatSize(data.length)} ZIP archive`);
  if (JSZip == null) {
    throw new Error('Unable to extract ROM image: JSZip is not available');
  }
  const files = new JSZip(data).file(/^.*\.nes$/i);
  if (files.length === 0) {
    throw new Error('ZIP archive does not contain ".nes" ROM image');
  }
  return files[0].asUint8Array();
}

function computeSHA1(cartridge, sha1) {
  if (sha1) {
    log.info('Computing SHA-1');
    const buffer = new Uint8Array(cartridge.prgROMSize + cartridge.chrROMSize);
    buffer.set(cartridge.prgROM);
    if (cartridge.chrROM) {
      buffer.set(cartridge.chrROM, cartridge.prgROMSize);
    }
    cartridge.sha1 = sha1(buffer);
  }
}

function printInfo(cartridge) {
  log.info('==========[Cartridge Info - Start]==========');
  log.info('SHA-1                 : ' + cartridge.sha1);
  log.info('Mapper                : ' + cartridge.mapper);
  log.info('Submapper             : ' + cartridge.submapper);
  log.info('Region                : ' + cartridge.region);
  log.info('Mirroring             : ' + cartridge.mirroring);
  log.info('PRG ROM size          : ' + formatSize(cartridge.prgROMSize));
  log.info('PRG RAM size          : ' + formatSize(cartridge.prgRAMSize));
  log.info('PRG RAM size (battery): ' + formatSize(cartridge.prgRAMSizeBattery));
  log.info('CHR ROM size          : ' + formatSize(cartridge.chrROMSize));
  log.info('CHR RAM size          : ' + formatSize(cartridge.chrRAMSize));
  log.info('CHR RAM size (battery): ' + formatSize(cartridge.chrRAMSizeBattery));
  log.info('==========[Cartridge Info - End]==========');
}
