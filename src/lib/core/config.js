// jscs:disable disallowQuotedKeysInObjects

import NES from './NES';
import CPU from './units/CPU';
import PPU from './units/PPU';
import APU from './units/APU';
import DMA from './units/DMA';
import CPUMemory from './units/CPUMemory';
import PPUMemory from './units/PPUMemory';
import CartridgeFactory from './factories/CartridgeFactory';
import DeviceFactory from './factories/DeviceFactory';
import MapperFactory from './factories/MapperFactory';
import PaletteFactory from './factories/PaletteFactory';

//=========================================================
// Emulator core configuration
//=========================================================

export default {
  'nes': {type: 'class', value: NES},
  'cpu': {type: 'class', value: CPU},
  'ppu': {type: 'class', value: PPU},
  'apu': {type: 'class', value: APU},
  'dma': {type: 'class', value: DMA},
  'cpuMemory': {type: 'class', value: CPUMemory},
  'ppuMemory': {type: 'class', value: PPUMemory},
  'cartridgeFactory': {type: 'class', value: CartridgeFactory},
  'deviceFactory': {type: 'class', value: DeviceFactory},
  'mapperFactory': {type: 'class', value: MapperFactory},
  'paletteFactory': {type: 'class', value: PaletteFactory},
  'hash': {type: 'value', value: null},  // Optional external dependency
  'jszip': {type: 'value', value: null}, // Optional external dependency
};
