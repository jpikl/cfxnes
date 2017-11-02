import {log, formatSize, describe} from '../common';
import parsers from './parsers';
import sha1 from './sha1';

export default function createCartridge(data) {
  log.info('Creating cartridge from ROM image');
  if (!(data instanceof Uint8Array)) {
    throw new Error('Invalid ROM image: ' + describe(data));
  }
  log.info(`Parsing ${formatSize(data.length)} of data`);
  for (const parser of parsers) {
    if (parser.supports(data)) {
      log.info(`Using "${parser.name}" parser`);
      const cartridge = parser.parse(data);
      computeSHA1(cartridge);
      printInfo(cartridge);
      return cartridge;
    }
  }
  throw new Error('Unknown ROM image format');
}

function computeSHA1(cartridge) {
  log.info('Computing SHA-1');
  const buffer = new Uint8Array(cartridge.prgROMSize + cartridge.chrROMSize);
  buffer.set(cartridge.prgROM);
  if (cartridge.chrROM) {
    buffer.set(cartridge.chrROM, cartridge.prgROMSize);
  }
  cartridge.sha1 = sha1(buffer);
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
