import AOROM from './mappers/AOROM';
import BNROM from './mappers/BNROM';
import CNROM from './mappers/CNROM';
import ColorDreams from './mappers/ColorDreams';
import MMC1 from './mappers/MMC1';
import MMC3 from './mappers/MMC3';
import NINA001 from './mappers/NINA001';
import NROM from './mappers/NROM';
import UNROM from './mappers/UNROM';
import {log} from './utils';

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
  const id = cartridge.mapper;
  const clazz = mappers[id];
  if (clazz) {
    log.info(`Creating "${id}" mapper`);
    return new clazz(cartridge);
  }
  throw new Error(`Unkown mapper "${id}"`);
}
