// jscs:disable disallowQuotedKeysInObjects, requireCapitalizedConstructors

import AOROMMapper from '../mappers/AOROMMapper';
import CNROMMapper from '../mappers/CNROMMapper';
import MMC1Mapper from '../mappers/MMC1Mapper';
import MMC3Mapper from '../mappers/MMC3Mapper';
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
    if (!clazz) {
      throw new Error(`Unsupported mapper "${name}"`);
    }
    logger.info(`Creating "${name}" mapper`);
    var mapper = new clazz(cartridge);
    return this.injector.inject(mapper);
  }

}
