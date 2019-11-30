import {log, describeValue, MapperType} from '../../common';

import AoRom from './AoRom';
import BnRom from './BnRom';
import CnRom from './CnRom';
import ColorDreams from './ColorDreams';
import Mmc1 from './Mmc1';
import Mmc3 from './Mmc3';
import Nina001 from './Nina001';
import NRom from './NRom';
import UnRom from './UnRom';

export {default as MapperInterface} from './MapperInterface';

const mappers = {
  [MapperType.AOROM]: AoRom,
  [MapperType.BNROM]: BnRom,
  [MapperType.CNROM]: CnRom,
  [MapperType.COLOR_DREAMS]: ColorDreams,
  [MapperType.MMC1]: Mmc1,
  [MapperType.MMC3]: Mmc3,
  [MapperType.NINA_001]: Nina001,
  [MapperType.NROM]: NRom,
  [MapperType.UNROM]: UnRom,
};

export function createMapper(cartridge) {
  const {mapper} = cartridge;
  const Mapper = mappers[mapper];
  if (Mapper) {
    log.info(`Creating "${mapper}" mapper`);
    return new Mapper(cartridge);
  }
  throw new Error('Invalid mapper: ' + describeValue(mapper));
}
