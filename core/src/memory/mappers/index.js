import {log, describe, Mapper as ID} from '../../common';

import AoRom from './AoRom';
import BnRom from './BnRom';
import CnRom from './CnRom';
import ColorDreams from './ColorDreams';
import Mmc1 from './Mmc1';
import Mmc3 from './Mmc3';
import Nina001 from './Nina001';
import NRom from './NRom';
import UnRom from './UnRom';

const mappers = {
  [ID.AOROM]: AoRom,
  [ID.BNROM]: BnRom,
  [ID.CNROM]: CnRom,
  [ID.COLOR_DREAMS]: ColorDreams,
  [ID.MMC1]: Mmc1,
  [ID.MMC3]: Mmc3,
  [ID.NINA_001]: Nina001,
  [ID.NROM]: NRom,
  [ID.UNROM]: UnRom,
};

export function createMapper(cartridge) {
  const name = cartridge.mapper;
  const Mapper = mappers[name];
  if (Mapper) {
    log.info(`Creating "${name}" mapper`);
    return new Mapper(cartridge);
  }
  throw new Error('Invalid mapper: ' + describe(name));
}
