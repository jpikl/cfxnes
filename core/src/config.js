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
  'nes': {class: NES},
  'cpu': {class: CPU},
  'ppu': {class: PPU},
  'apu': {class: APU},
  'dma': {class: DMA},
  'cpuMemory': {class: CPUMemory},
  'ppuMemory': {class: PPUMemory},
  'cartridgeFactory': {class: CartridgeFactory},
  'deviceFactory': {class: DeviceFactory},
  'mapperFactory': {class: MapperFactory},
  'paletteFactory': {class: PaletteFactory},
  'sha1': {value: null},  // Optional external dependency
  'JSZip': {value: null}, // Optional external dependency
};
