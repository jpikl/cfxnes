import {toString} from '../common/utils';
import log from '../common/log';
import AOROM from './mappers/AOROM';
import BNROM from './mappers/BNROM';
import CNROM from './mappers/CNROM';
import ColorDreams from './mappers/ColorDreams';
import MMC1 from './mappers/MMC1';
import MMC3 from './mappers/MMC3';
import NINA001 from './mappers/NINA001';
import NROM from './mappers/NROM';
import UNROM from './mappers/UNROM';

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
