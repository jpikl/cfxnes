import {log, describe, Mapper as ID} from '../../common';

import AOROM from './AOROM';
import BNROM from './BNROM';
import CNROM from './CNROM';
import ColorDreams from './ColorDreams';
import MMC1 from './MMC1';
import MMC3 from './MMC3';
import NINA001 from './NINA001';
import NROM from './NROM';
import UNROM from './UNROM';

const mappers = {
  [ID.AOROM]: AOROM,
  [ID.BNROM]: BNROM,
  [ID.CNROM]: CNROM,
  [ID.COLOR_DREAMS]: ColorDreams,
  [ID.MMC1]: MMC1,
  [ID.MMC3]: MMC3,
  [ID.NINA_001]: NINA001,
  [ID.NROM]: NROM,
  [ID.UNROM]: UNROM,
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
