import {copyArray} from '../utils/array';
import {formatOpt, formatSize, formatData} from '../utils/format';
import Mirroring from '../common/Mirroring';
import Region from '../common/Region';
import Uint8ArrayReader from '../readers/Uint8ArrayReader';
import FileSystemReader from '../readers/FileSystemReader';
import INESLoader from '../loaders/INESLoader';
import NES2Loader from '../loaders/NES2Loader';
import logger from '../utils/logger';

const loaders = [
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
    for (const loader of loaders) {
      if (loader.supports(reader)) {
        logger.info(`Using "${loader.name}" loader`);
        const cartridge = loader.load(reader);
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
    logger.info('has PRG RAM           : ' + formatOpt(cartridge.hasPRGRAM));
    logger.info('has PRG RAM battery   : ' + formatOpt(cartridge.hasPRGRAMBattery));
    logger.info('has CHR ROM           : ' + formatOpt(cartridge.hasCHRROM));
    logger.info('has CHR RAM           : ' + formatOpt(cartridge.hasCHRRAM));
    logger.info('has CHR RAM battery   : ' + formatOpt(cartridge.hasCHRRAMBattery));
    logger.info('has trainer           : ' + formatOpt(cartridge.hasTrainer));
    logger.info('PRG ROM size          : ' + formatOpt(formatSize(cartridge.prgROMSize)));
    logger.info('PRG RAM size          : ' + formatOpt(formatSize(cartridge.prgRAMSize)));
    logger.info('PRG RAM size (battery): ' + formatOpt(formatSize(cartridge.prgRAMSizeBattery)));
    logger.info('CHR ROM size          : ' + formatOpt(formatSize(cartridge.chrROMSize)));
    logger.info('CHR RAM size          : ' + formatOpt(formatSize(cartridge.chrRAMSize)));
    logger.info('CHR RAM size (battery): ' + formatOpt(formatSize(cartridge.chrRAMSizeBattery)));
    logger.info('Mirroring             : ' + formatOpt(Mirroring.toString(cartridge.mirroring)));
    logger.info('Region                : ' + formatOpt(Region.toString(cartridge.region)));
    logger.info('is Vs Unisistem       : ' + formatOpt(cartridge.isVsUnisistem));
    logger.info('is PlayChoice         : ' + formatOpt(cartridge.isPlayChoice));
    logger.info('Trainer               : ' + formatOpt(formatData(cartridge.trainer)));
    logger.info('==========[Cartridge Info - End]==========');
  }

}
