import Mirroring from '../common/Mirroring';
import Region from '../common/Region';
import logger from '../utils/logger';
import Uint8ArrayReader from '../readers/Uint8ArrayReader';
import FileSystemReader from '../readers/FileSystemReader';
import INESLoader from '../loaders/INESLoader';
import NES2Loader from '../loaders/NES2Loader';
import {copyArray} from '../utils/arrays';
import {formatOptional, formatSize, formatData} from '../utils/format';

var loaders = [
  new NES2Loader, // Must be processed before iNES
  new INESLoader,
];

//=========================================================
// Factory for cartridge creation
//=========================================================

export default class CartridgeFactory {

  constructor() {
    this.dependencies = ['jszip', 'sha1'];
  }

  inject(JSZip, sha1) {
    this.JSZip = JSZip;
    this.sha1 = sha1;
  }

  readArray(array) {
    logger.info('Creating cartridge from array');
    if (array instanceof Array || array instanceof ArrayBuffer) {
      array = new Uint8Array(array);
    }
    return this.read(new Uint8ArrayReader(array));
  }

  readFile(path) {
    logger.info(`Creating cartridge from file "${path}"`);
    return this.read(new FileSystemReader(path));
  }

  read(reader) {
    reader.tryUnzip(this.JSZip);
    for (var loader of loaders) {
      if (loader.supports(reader)) {
        logger.info(`Using "${loader.name}" loader`);
        var cartridge = loader.load(reader);
        if (this.sha1) {
          this.computeSha1(cartridge);
        }
        this.printCartridgeInfo(cartridge);
        return cartridge;
      }
    }
    throw new Error('Unsupported input data format.');
  }

  computeSha1(cartridge) {
    logger.info('Computing SHA-1');
    var buffer = new Uint8Array(cartridge.prgROMSize + cartridge.chrROMSize);
    copyArray(cartridge.prgROM, buffer, 0, 0);
    copyArray(cartridge.chrROM, buffer, 0, cartridge.prgROMSize);
    cartridge.sha1 = this.sha1(buffer);
  }

  printCartridgeInfo(cartridge) {
    logger.info('==========[Cartridge Info - Start]==========');
    logger.info('SHA-1                 : ' + formatOptional(cartridge.sha1));
    logger.info('Mapper                : ' + formatOptional(cartridge.mapper));
    logger.info('Submapper             : ' + formatOptional(cartridge.submapper));
    logger.info('has PRG RAM           : ' + formatOptional(cartridge.hasPRGRAM));
    logger.info('has PRG RAM battery   : ' + formatOptional(cartridge.hasPRGRAMBattery));
    logger.info('has CHR ROM           : ' + formatOptional(cartridge.hasCHRROM));
    logger.info('has CHR RAM           : ' + formatOptional(cartridge.hasCHRRAM));
    logger.info('has CHR RAM battery   : ' + formatOptional(cartridge.hasCHRRAMBattery));
    logger.info('has trainer           : ' + formatOptional(cartridge.hasTrainer));
    logger.info('PRG ROM size          : ' + formatOptional(formatSize(cartridge.prgROMSize)));
    logger.info('PRG RAM size          : ' + formatOptional(formatSize(cartridge.prgRAMSize)));
    logger.info('PRG RAM size (battery): ' + formatOptional(formatSize(cartridge.prgRAMSizeBattery)));
    logger.info('CHR ROM size          : ' + formatOptional(formatSize(cartridge.chrROMSize)));
    logger.info('CHR RAM size          : ' + formatOptional(formatSize(cartridge.chrRAMSize)));
    logger.info('CHR RAM size (battery): ' + formatOptional(formatSize(cartridge.chrRAMSizeBattery)));
    logger.info('Mirroring             : ' + formatOptional(Mirroring.toString(cartridge.mirroring)));
    logger.info('Region                : ' + formatOptional(Region.toString(cartridge.region)));
    logger.info('is Vs Unisistem       : ' + formatOptional(cartridge.isVsUnisistem));
    logger.info('is PlayChoice         : ' + formatOptional(cartridge.isPlayChoice));
    logger.info('Trainer               : ' + formatOptional(formatData(cartridge.trainer)));
    logger.info('==========[Cartridge Info - End]==========');
  }

}
