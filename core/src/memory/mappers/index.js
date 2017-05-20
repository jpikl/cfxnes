import {log, toString} from '../../common';

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
  'AOROM': AOROM,
  'BNROM': BNROM,
  'CNROM': CNROM,
  'ColorDreams': ColorDreams,
  'MMC1': MMC1,
  'MMC3': MMC3,
  'NINA-001': NINA001,
  'NROM': NROM,
  'UNROM': UNROM,
};

export function createMapper(cartridge) {
  const name = cartridge.mapper;
  const Mapper = mappers[name];
  if (Mapper) {
    log.info(`Creating "${name}" mapper`);
    return new Mapper(cartridge);
  }
  throw new Error('Invalid mapper: ' + toString(name));
}
