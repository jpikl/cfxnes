import {Bus, BusConnected, log, Mirroring} from '../../common';
import MapperInterface from './MapperInterface';

/**
 * @implements {MapperInterface}
 * @implements {BusConnected}
 */
export default class Mapper {

  //=========================================================
  // Initialization
  //=========================================================

  constructor(cartridge) {
    log.info('Initializing mapper');

    this.mirroring = cartridge.mirroring;
    this.prgRom = cartridge.prgRom;
    this.chrRom = cartridge.chrRom;
    this.prgRomSize = cartridge.prgRomSize;
    this.chrRomSize = cartridge.chrRomSize;

    const {prgRamSize, prgRamSizeBattery} = cartridge;
    this.prgRam = prgRamSize ? new Uint8Array(prgRamSize) : null;
    this.prgRamSize = prgRamSize;
    this.prgRamSizeBattery = prgRamSizeBattery;
    this.canReadPrgRam = prgRamSize > 0; // PRG RAM read protection
    this.canWritePrgRam = prgRamSize > 0; // PRG RAM write protection
    this.hasPrgRamRegisters = false; // Whether registers are mapped in PRG RAM address space

    const {chrRamSize, chrRamSizeBattery} = cartridge;
    this.chrRam = chrRamSize ? new Uint8Array(chrRamSize) : null;
    this.chrRamSize = chrRamSize;
    this.chrRamSizeBattery = chrRamSizeBattery;

    // Either there is battery-backed PRG RAM or battery-backed CHR RAM.
    // Only known game using battery-backed CHR RAM is RacerMate Challenge II.
    if (prgRamSizeBattery) {
      this.nvram = this.prgRam.subarray(0, prgRamSizeBattery);
    } else if (chrRamSizeBattery) {
      this.nvram = this.chrRam.subarray(0, chrRamSizeBattery);
    } else {
      this.nvram = null;
    }

    this.cpu = null;
    this.ppu = null;
    this.cpuMemory = null;
    this.ppuMemory = null;
  }

  /**
   * Connects mapper to bus.
   * @param {!Bus} bus Bus.
   * @override
   */
  connectToBus(bus) {
    log.info('Connecting mapper to bus');

    this.cpu = bus.getCpu();
    this.ppu = bus.getPpu();
    this.cpuMemory = bus.getCpuMemory();
    this.ppuMemory = bus.getPpuMemory();

    this.cpu.connectToMapper(this);
    this.cpuMemory.connectToMapper(this);
    this.ppuMemory.connectToMapper(this);
  }

  /**
   * Disconnects mapper from bus.
   * @override
   */
  disconnectFromBus() {
    log.info('Disconnecting mapper from bus');

    this.ppuMemory.disconnectFromMapper();
    this.cpuMemory.disconnectFromMapper();
    this.cpu.disconnectFromMapper();

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
    this.resetPrgRam();
    this.resetChrRam();
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

  mapPrgRomBank32K(srcBank, dstBank) {
    this.mapPrgRomBank8K(srcBank * 4, dstBank * 4, 4);
  }

  mapPrgRomBank16K(srcBank, dstBank) {
    this.mapPrgRomBank8K(srcBank * 2, dstBank * 2, 2);
  }

  mapPrgRomBank8K(srcBank, dstBank, count = 1) {
    const maxBank = (this.prgRomSize - 1) >> 13;
    for (let i = 0; i < count; i++) {
      this.cpuMemory.mapPrgRomBank(srcBank + i, (dstBank + i) & maxBank);
    }
  }

  //=========================================================
  // PRG RAM
  //=========================================================

  resetPrgRam() {
    if (this.prgRam) {
      this.prgRam.fill(0, this.prgRamSizeBattery); // Keep battery-backed part of PRG RAM
    }
  }

  mapPrgRamBank8K(srcBank, dstBank) {
    const maxBank = (this.prgRamSize - 1) >> 13;
    this.cpuMemory.mapPrgRamBank(srcBank, dstBank & maxBank);
  }

  //=========================================================
  // CHR ROM/RAM
  //=========================================================

  resetChrRam() {
    if (this.chrRam) {
      this.chrRam.fill(0, this.chrRamSizeBattery); // Keep battery-backed part of CHR RAM
    }
  }

  mapChrBank8K(srcBank, dstBank) {
    this.mapChrBank1K(srcBank * 8, dstBank * 8, 8);
  }

  mapChrBank4K(srcBank, dstBank) {
    this.mapChrBank1K(srcBank * 4, dstBank * 4, 4);
  }

  mapChrBank2K(srcBank, dstBank) {
    this.mapChrBank1K(srcBank * 2, dstBank * 2, 2);
  }

  mapChrBank1K(srcBank, dstBank, count = 1) {
    const chrSize = this.chrRomSize || this.chrRamSize;
    const maxBank = (chrSize - 1) >> 10;
    for (let i = 0; i < count; i++) {
      this.ppuMemory.mapPatternsBank(srcBank + i, (dstBank + i) & maxBank);
    }
  }

  //=========================================================
  // Non-volatile part of PRG/CHR RAM
  //=========================================================

  getNVRam() {
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
