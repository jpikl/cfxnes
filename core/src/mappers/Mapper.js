import {zeroArray} from '../utils/array';
import {Mirroring} from '../enums';
import logger from '../utils/logger';

export default class Mapper {

  //=========================================================
  // Initialization
  //=========================================================

  constructor(cartridge) {
    this.init(cartridge);
    this.initPRGRAM();
    this.initCHRRAM();
  }

  init(cartridge) {
    this.sha1 = cartridge.sha1;
    this.submapper = cartridge.submapper; // Not present on iNES ROMs
    this.mirroring = cartridge.mirroring;
    this.prgROMSize = cartridge.prgROMSize;
    this.prgRAMSize = cartridge.prgRAMSize; // Not reliable information on iNES ROMs (should provide mapper itself)
    this.prgRAMSizeBattery = cartridge.prgRAMSizeBattery; // Not present on iNES ROMs
    this.chrROMSize = cartridge.chrROMSize;
    this.chrRAMSize = cartridge.chrRAMSize;
    this.chrRAMSizeBattery = cartridge.chrRAMSizeBattery; // Not present on iNES ROMs
    this.prgROM = cartridge.prgROM;
    this.chrROM = cartridge.chrROM;
    this.hasPRGRAMRegisters = false; // Whether mapper registers are mapped in PRG RAM address space
    this.canReadPRGRAM = true; // PRG RAM read protection
    this.canWritePRGRAM = true; // PRG RAM write protection
  }

  connect(nes) {
    this.cpu = nes.cpu;
    this.ppu = nes.ppu;
    this.cpuMemory = nes.cpuMemory;
    this.ppuMemory = nes.ppuMemory;
    this.cpu.setMapper(this);
    this.cpuMemory.setMapper(this);
    this.ppuMemory.setMapper(this);
  }

  disconnect() {
    this.ppuMemory.setMapper(undefined);
    this.cpuMemory.setMapper(undefined);
    this.cpu.setMapper(undefined);
    this.ppuMemory = undefined;
    this.cpuMemory = undefined;
    this.ppu = undefined;
    this.cpu = undefined;
  }

  //=========================================================
  // Reset
  //=========================================================

  powerUp() {
    logger.info('Resetting mapper');
    this.resetPRGRAM();
    this.resetCHRRAM();
    this.reset();
  }

  reset() {
    // For mapper to implement
  }

  //=========================================================
  // Inputs
  //=========================================================

  write() {
    // For mapper to implement
  }

  tick() {
    // For mapper to implement
  }

  //=========================================================
  // PRG ROM mapping
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
  // PRG RAM mapping
  //=========================================================

  initPRGRAM() {
    if (this.prgRAMSize) {
      this.prgRAM = new Uint8Array(this.prgRAMSize);
    }
  }

  resetPRGRAM() {
    if (this.prgRAM) {
      zeroArray(this.prgRAM, this.prgRAMSizeBattery); // Keep battery-backed part of PRGRAM
    }
  }

  mapPRGRAMBank8K(srcBank, dstBank) {
    const maxBank = (this.prgRAMSize - 1) >> 13;
    this.cpuMemory.mapPRGRAMBank(srcBank, dstBank & maxBank);
  }

  //=========================================================
  // CHR ROM mapping
  //=========================================================

  mapCHRROMBank8K(srcBank, dstBank) {
    this.mapCHRROMBank1K(srcBank * 8, dstBank * 8, 8);
  }

  mapCHRROMBank4K(srcBank, dstBank) {
    this.mapCHRROMBank1K(srcBank * 4, dstBank * 4, 4);
  }

  mapCHRROMBank2K(srcBank, dstBank) {
    this.mapCHRROMBank1K(srcBank * 2, dstBank * 2, 2);
  }

  mapCHRROMBank1K(srcBank, dstBank, count = 1) {
    const maxBank = (this.chrROMSize - 1) >> 10;
    for (let i = 0; i < count; i++) {
      this.ppuMemory.mapPatternsBank(srcBank + i, (dstBank + i) & maxBank);
    }
  }

  //=========================================================
  // CHR RAM mapping
  //=========================================================

  // Note: Only known game using battery-backed CHR RAM is RacerMate Challenge II

  initCHRRAM() {
    if (this.chrRAMSize) {
      this.chrRAM = new Uint8Array(this.chrRAMSize);
    }
  }

  resetCHRRAM() {
    if (this.chrRAM) {
      zeroArray(this.chrRAM, this.chrRAMSizeBattery); // Keep battery-backed part of CHRRAM
    }
  }

  mapCHRRAMBank8K(srcBank, dstBank) {
    this.mapCHRRAMBank1K(srcBank * 8, dstBank * 8, 8);
  }

  mapCHRRAMBank4K(srcBank, dstBank) {
    this.mapCHRRAMBank1K(srcBank * 4, dstBank * 4, 4);
  }

  mapCHRRAMBank2K(srcBank, dstBank) {
    this.mapCHRRAMBank1K(srcBank * 2, dstBank * 2, 2);
  }

  mapCHRRAMBank1K(srcBank, dstBank, count = 1) {
    const maxBank = (this.chrRAMSize - 1) >> 10;
    for (let i = 0; i < count; i++) {
      this.ppuMemory.mapPatternsBank(srcBank + i, (dstBank + i) & maxBank);
    }
  }

  //=========================================================
  // Non-Volatile RAM
  //=========================================================

  getNVRAMSize() {
    // No know NES game uses both battery-backed PRGRAM and CHRRAM
    return this.prgRAMSizeBattery || this.chrRAMSizeBattery;
  }

  getNVRAM() {
    if (this.prgRAMSizeBattery) {
      return this.prgRAM.subarray(0, this.prgRAMSizeBattery);
    }
    if (this.chrRAMSizeBattery) {
      return this.chrRAM.subarray(0, this.chrRAMSizeBattery);
    }
    return null;
  }

  setNVRAM(data) {
    if (this.prgRAMSizeBattery) {
      this.prgRAM.set(data.subarray(0, this.prgRAMSizeBattery));
    } else if (this.chrRAMSizeBattery) {
      this.chrRAM.set(data.subarray(0, this.chrRAMSizeBattery));
    }
  }

  //=========================================================
  // Names / attribute tables mirroring
  //=========================================================

  setSingleScreenMirroring(area = 0) {
    this.ppuMemory.setNamesAttrsMirroring(Mirroring.getSingleScreen(area));
  }

  setVerticalMirroring() {
    this.ppuMemory.setNamesAttrsMirroring(Mirroring.VERTICAL);
  }

  setHorizontalMirroring() {
    this.ppuMemory.setNamesAttrsMirroring(Mirroring.HORIZONTAL);
  }

  setFourScreenMirroring() {
    this.ppuMemory.setNamesAttrsMirroring(Mirroring.FOUR_SCREEN);
  }

  setMirroring(area0, area1, area2, area3) {
    this.ppuMemory.mapNamesAttrsAreas([area0, area1, area2, area3]);
  }

}
