import {copyArray} from '../utils/array';
import {formatOpt, formatSize} from '../utils/format';
import Mirroring from '../common/Mirroring';
import Region from '../common/Region';
import ines from '../loaders/ines';
import logger from '../utils/logger';

const loaders = [ines];

//=========================================================
// Factory for cartridge creation
//=========================================================

export default class CartridgeFactory {

  constructor() {
    this.dependencies = ['JSZip', 'sha1'];
  }

  inject(JSZip, sha1) {
    this.JSZip = JSZip;
    this.sha1 = sha1;
  }

  readFile(path) {
    logger.info(`Creating cartridge from file "${path}"`);
    return this.readArray(require('fs').readFileSync(path));
  }

  readArray(array) {
    logger.info('Creating cartridge from array');
    if (array instanceof Array || array instanceof ArrayBuffer) {
      array = new Uint8Array(array);
    }
    return this.read(array);
  }

  read(data) {
    if (this.hasZipSignature(data)) {
      data = this.unzip(data);
    }
    for (const loader of loaders) {
      if (loader.supports(data)) {
        logger.info(`Using "${loader.name}" loader`);
        const cartridge = loader.load(data);
        if (this.sha1) {
          this.computeSha1(cartridge);
        }
        this.printCartridgeInfo(cartridge);
        return cartridge;
      }
    }
    throw new Error('Unsupported input data format.');
  }

  hasZipSignature(data) {
    return data[0] === 0x50
        && data[1] === 0x45
        && data[2] === 0x03
        && data[3] === 0x04;
  }

  unzip(data) {
    logger.info('Unzipping ROM image');
    if (this.JSZip == null) {
      throw new Error('Unable to unzip ROM image: JSZip is not available.');
    }
    const files = new this.JSZip(data).file(/^.*\.nes$/i);
    if (files.length === 0) {
      throw new Error('ZIP does not contain ".nes" ROM image');
    }
    return files[0].asUint8Array();
  }

  computeSha1(cartridge) {
    logger.info('Computing SHA-1');
    const buffer = new Uint8Array(cartridge.prgROMSize + cartridge.chrROMSize);
    copyArray(cartridge.prgROM, buffer, 0, 0);
    copyArray(cartridge.chrROM, buffer, 0, cartridge.prgROMSize);
    cartridge.sha1 = this.sha1(buffer);
  }

  printCartridgeInfo(cartridge) {
    logger.info('==========[Cartridge Info - Start]==========');
    logger.info('SHA-1                 : ' + formatOpt(cartridge.sha1));
    logger.info('Mapper                : ' + formatOpt(cartridge.mapper));
    logger.info('Submapper             : ' + formatOpt(cartridge.submapper));
    logger.info('PRG ROM size          : ' + formatOpt(formatSize(cartridge.prgROMSize)));
    logger.info('PRG RAM size          : ' + formatOpt(formatSize(cartridge.prgRAMSize)));
    logger.info('PRG RAM size (battery): ' + formatOpt(formatSize(cartridge.prgRAMSizeBattery)));
    logger.info('CHR ROM size          : ' + formatOpt(formatSize(cartridge.chrROMSize)));
    logger.info('CHR RAM size          : ' + formatOpt(formatSize(cartridge.chrRAMSize)));
    logger.info('CHR RAM size (battery): ' + formatOpt(formatSize(cartridge.chrRAMSizeBattery)));
    logger.info('Mirroring             : ' + formatOpt(Mirroring.toString(cartridge.mirroring)));
    logger.info('Region                : ' + formatOpt(Region.toString(cartridge.region)));
    logger.info('==========[Cartridge Info - End]==========');
  }

}
