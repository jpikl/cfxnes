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
      computeSha1(cartridge);
      printInfo(cartridge);
      return cartridge;
    }
  }
  throw new Error('Unknown ROM image format');
}

function computeSha1(cartridge) {
  log.info('Computing SHA-1');
  const buffer = new Uint8Array(cartridge.prgRomSize + cartridge.chrRomSize);
  buffer.set(cartridge.prgRom);
  if (cartridge.chrRom) {
    buffer.set(cartridge.chrRom, cartridge.prgRomSize);
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
  log.info('PRG ROM size          : ' + formatSize(cartridge.prgRomSize));
  log.info('PRG RAM size          : ' + formatSize(cartridge.prgRamSize));
  log.info('PRG RAM size (battery): ' + formatSize(cartridge.prgRamSizeBattery));
  log.info('CHR ROM size          : ' + formatSize(cartridge.chrRomSize));
  log.info('CHR RAM size          : ' + formatSize(cartridge.chrRamSize));
  log.info('CHR RAM size (battery): ' + formatSize(cartridge.chrRamSizeBattery));
  log.info('==========[Cartridge Info - End]==========');
}
