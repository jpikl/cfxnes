import NES from './NES';
import CPU from './units/CPU';
import PPU from './units/PPU';
import APU from './units/APU';
import DMA from './units/DMA';
import CPUMemory from './units/CPUMemory';
import PPUMemory from './units/PPUMemory';

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
  'sha1': {value: null},  // Optional external dependency
  'JSZip': {value: null}, // Optional external dependency
};
