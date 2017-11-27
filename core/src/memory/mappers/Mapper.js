import {log, Mirroring} from '../../common';

export default class Mapper {

  //=========================================================
  // Initialization
  //=========================================================

  constructor(cartridge) {
    log.info('Initializing mapper');

    this.mirroring = cartridge.mirroring;
    this.prgROM = cartridge.prgROM;
    this.chrROM = cartridge.chrROM;
    this.prgROMSize = cartridge.prgROMSize;
    this.chrROMSize = cartridge.chrROMSize;

    const {prgRAMSize, prgRAMSizeBattery} = cartridge;
    this.prgRAM = prgRAMSize ? new Uint8Array(prgRAMSize) : null;
    this.prgRAMSize = prgRAMSize;
    this.prgRAMSizeBattery = prgRAMSizeBattery;
    this.canReadPRGRAM = prgRAMSize > 0; // PRG RAM read protection
    this.canWritePRGRAM = prgRAMSize > 0; // PRG RAM write protection
    this.hasPRGRAMRegisters = false; // Whether registers are mapped in PRG RAM address space

    const {chrRAMSize, chrRAMSizeBattery} = cartridge;
    this.chrRAM = chrRAMSize ? new Uint8Array(chrRAMSize) : null;
    this.chrRAMSize = chrRAMSize;
    this.chrRAMSizeBattery = chrRAMSizeBattery;

    // Either there is battery-backed PRG RAM or battery-backed CHR RAM.
    // Only known game using battery-backed CHR RAM is RacerMate Challenge II.
    if (prgRAMSizeBattery) {
      this.nvram = this.prgRAM.subarray(0, prgRAMSizeBattery);
    } else if (chrRAMSizeBattery) {
      this.nvram = this.chrRAM.subarray(0, chrRAMSizeBattery);
    } else {
      this.nvram = null;
    }

    this.cpu = null;
    this.ppu = null;
    this.cpuMemory = null;
    this.ppuMemory = null;
  }

  connect(nes) {
    log.info('Connecting mapper');

    this.cpu = nes.cpu;
    this.ppu = nes.ppu;
    this.cpuMemory = nes.cpuMemory;
    this.ppuMemory = nes.ppuMemory;

    this.cpu.setMapper(this);
    this.cpuMemory.setMapper(this);
    this.ppuMemory.setMapper(this);
  }

  disconnect() {
    log.info('Disconnecting mapper');

    this.ppuMemory.setMapper(null);
    this.cpuMemory.setMapper(null);
    this.cpu.setMapper(null);

    this.ppuMemory = null;
    this.cpuMemory = null;
    this.ppu = null;
    this.cpu = null;
  }

  //=========================================================
  // Reset
  //=========================================================

  reset() {
    log.info('Resetting mapper');
    this.resetPRGRAM();
    this.resetCHRRAM();
    this.resetState();
  }

  //=========================================================
  // Callbacks
  //=========================================================

  resetState() {
  }

  write(address, value) { // eslint-disable-line no-unused-vars
  }

  tick() {
  }

  //=========================================================
  // PRG ROM
  //=========================================================

  mapPRGROMBank32K(srcBank, dstBank) {
    this.mapPRGROMBank8K(srcBank * 4, dstBank * 4, 4);
  }

  mapPRGROMBank16K(srcBank, dstBank) {
    this.mapPRGROMBank8K(srcBank * 2, dstBank * 2, 2);
  }

  mapPRGROMBank8K(srcBank, dstBank, count = 1) {
    const maxBank = (this.prgROMSize - 1) >> 13;
    for (let i = 0; i < count; i++) {
      this.cpuMemory.mapPRGROMBank(srcBank + i, (dstBank + i) & maxBank);
    }
  }

  //=========================================================
  // PRG RAM
  //=========================================================

  resetPRGRAM() {
    if (this.prgRAM) {
      this.prgRAM.fill(0, this.prgRAMSizeBattery); // Keep battery-backed part of PRGRAM
    }
  }

  mapPRGRAMBank8K(srcBank, dstBank) {
    const maxBank = (this.prgRAMSize - 1) >> 13;
    this.cpuMemory.mapPRGRAMBank(srcBank, dstBank & maxBank);
  }

  //=========================================================
  // CHR ROM/RAM
  //=========================================================

  resetCHRRAM() {
    if (this.chrRAM) {
      this.chrRAM.fill(0, this.chrRAMSizeBattery); // Keep battery-backed part of CHRRAM
    }
  }

  mapCHRBank8K(srcBank, dstBank) {
    this.mapCHRBank1K(srcBank * 8, dstBank * 8, 8);
  }

  mapCHRBank4K(srcBank, dstBank) {
    this.mapCHRBank1K(srcBank * 4, dstBank * 4, 4);
  }

  mapCHRBank2K(srcBank, dstBank) {
    this.mapCHRBank1K(srcBank * 2, dstBank * 2, 2);
  }

  mapCHRBank1K(srcBank, dstBank, count = 1) {
    const chrSize = this.chrROMSize || this.chrRAMSize;
    const maxBank = (chrSize - 1) >> 10;
    for (let i = 0; i < count; i++) {
      this.ppuMemory.mapPatternsBank(srcBank + i, (dstBank + i) & maxBank);
    }
  }

  //=========================================================
  // Non-volatile part of PRG/CHR RAM
  //=========================================================

  getNVRAM() {
    return this.nvram;
  }

  //=========================================================
  // Nametables mirroring
  //=========================================================

  setSingleScreenMirroring(area = 0) {
    this.ppuMemory.setNametablesMirroring(Mirroring.getSingle(area));
  }

  setVerticalMirroring() {
    this.ppuMemory.setNametablesMirroring(Mirroring.VERTICAL);
  }

  setHorizontalMirroring() {
    this.ppuMemory.setNametablesMirroring(Mirroring.HORIZONTAL);
  }

  setFourScreenMirroring() {
    this.ppuMemory.setNametablesMirroring(Mirroring.FOUR_SCREEN);
  }

}
