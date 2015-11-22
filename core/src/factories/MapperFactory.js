// jscs:disable disallowQuotedKeysInObjects, requireCapitalizedConstructors

import AOROMMapper from '../mappers/AOROMMapper';
import BNROMMapper from '../mappers/BNROMMapper';
import CNROMMapper from '../mappers/CNROMMapper';
import ColorDreamsMapper from '../mappers/ColorDreamsMapper';
import MMC1Mapper from '../mappers/MMC1Mapper';
import MMC3Mapper from '../mappers/MMC3Mapper';
import NINA001Mapper from '../mappers/NINA001Mapper';
import NROMMapper from '../mappers/NROMMapper';
import UNROMMapper from '../mappers/UNROMMapper';
import logger from '../utils/logger';

var mappers = {
  'NROM': NROMMapper,
  'MMC1': MMC1Mapper,
  'UNROM': UNROMMapper,
  'CNROM': CNROMMapper,
  'MMC3': MMC3Mapper,
  'AOROM': AOROMMapper,
  'BNROM': BNROMMapper,
  'ColorDreams': ColorDreamsMapper,
  'NINA-001': NINA001Mapper,
};

//=========================================================
// Factory for mapper creation
//=========================================================

export default class MapperFactory {

  constructor(injector) {
    this.injector = injector;
  }

  createMapper(cartridge) {
    var name = cartridge.mapper;
    var clazz = mappers[name];
    if (clazz) {
      logger.info(`Creating "${name}" mapper`);
      var mapper = new clazz(cartridge);
      return this.injector.inject(mapper);
    }
    throw new Error(`Unsupported mapper "${name}"`);
  }

}
