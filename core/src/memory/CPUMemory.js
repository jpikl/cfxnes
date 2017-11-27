import {log} from '../common';

// $10000 +------------------------+-------------------+ $10000
//        |   Upper PRG ROM bank   |                   |
//  $C000 +------------------------+  PRG ROM (32 KB)  |
//        |   Lower PRG ROM bank   |                   |
//  $8000 +------------------------+-------------------+ $8000
//        |                PRG RAM (8 KB)              |
//  $6000 +--------------------------------------------+ $6000
//        |            Expansion ROM (~8 KB)           |
//  $4020 +------------------------+-------------------+ $4020
//        |  APU & I/O registers   |                   |
//  $4000 +------------------------+                   |
//        | Mirrors of $2000-$2007 |     Registers     |
//  $2008 +------------------------+                   |
//        |     PPU registers      |                   |
//  $2000 +------------------------+-------------------+ $2000
//        |           Mirrors of $0000-$07FF           |
//  $0800 +--------------------------------------------+ $0800
//        |                                            |
//  $0200 +------------------------+                   |
//        |          Stack         |     RAM (2 KB)    |
//  $0100 +------------------------+                   |
//        |        Zero page       |                   |
//  $0000 +------------------------+-------------------+ $0000

export default class CPUMemory {

  //=========================================================
  // Initialization
  //=========================================================

  constructor() {
    log.info('Initializing CPU memory');

    this.ram = new Uint8Array(0x800); // 2KB of RAM mirrored in $0800-$1FFF
    this.prgROM = null; // PRG ROM (will be loaded from mapper)
    this.prgRAM = null; // PRG RAM (will be loaded from mapper)
    this.prgROMMapping = new Uint32Array(4); // Base addresses of each 8K PRG ROM bank
    this.prgRAMMapping = 0; // Base address of 8K PRG RAM bank

    this.inputDevices = [null, null, null]; // Indices 1 and 2 are used as ports for devices
    this.inputStrobe = 0; // Strobe counter

    this.ppu = null;
    this.apu = null;
    this.dma = null;
    this.mapper = null;
  }

  connect(nes) {
    log.info('Connecting CPU memory');
    this.ppu = nes.ppu;
    this.apu = nes.apu;
    this.dma = nes.dma;
  }

  setMapper(mapper) {
    this.mapper = mapper;
    this.prgRAM = mapper && mapper.prgRAM;
    this.prgROM = mapper && mapper.prgROM;
  }

  //=========================================================
  // Reset
  //=========================================================

  reset() {
    log.info('Resetting CPU memory');
    this.resetRAM();
    this.resetRegisters();
    this.resetPRGRAM();
    this.resetPRGROM();
  }

  //=========================================================
  // Memory access
  //=========================================================

  read(address) {
    if (address >= 0x8000) {
      return this.readPRGROM(address);    // $8000-$FFFF
    } else if (address < 0x2000) {
      return this.readRAM(address);       // $0000-$1FFF
    } else if (address < 0x4020) {
      return this.readRegister(address); // $2000-$401F
    } else if (address >= 0x6000) {
      return this.readPRGRAM(address);    // $6000-$7FFF
    }
    return this.readEXROM(address);       // $4020-$5FFF
  }

  write(address, value) {
    if (address >= 0x8000) {
      this.writePRGROM(address, value);    // $8000-$FFFF
    } else if (address < 0x2000) {
      this.writeRAM(address, value);       // $0000-$1FFF
    } else if (address < 0x4020) {
      this.writeRegister(address, value); // $2000-$401F
    } else if (address >= 0x6000) {
      this.writePRGRAM(address, value);    // $6000-$7FFF
    } else {
      this.writeEXROM(address, value);     // $4020-$5FFF
    }
  }

  //=========================================================
  // RAM ($0000-$1FFF)
  //=========================================================

  resetRAM() {
    this.ram.fill(0);
  }

  readRAM(address) {
    return this.ram[this.mapRAMAddress(address)];
  }

  writeRAM(address, value) {
    this.ram[this.mapRAMAddress(address)] = value;
  }

  mapRAMAddress(address) {
    return address & 0x07FF; // Mirroring of $0000-$07FF in $0800-$1FFF
  }

  //=========================================================
  // Registers ($2000-$401F)
  //=========================================================

  resetRegisters() {
    this.inputStrobe = 0;
  }

  readRegister(address) {
    switch (this.mapRegisterAddress(address)) {
      case 0x2002: return this.ppu.readStatus();
      case 0x2004: return this.ppu.readOAMData();
      case 0x2007: return this.ppu.readData();
      case 0x4015: return this.apu.readStatus();
      case 0x4016: return this.readInputDevice(1);
      case 0x4017: return this.readInputDevice(2);
      default: return 0;
    }
  }

  writeRegister(address, value) {
    switch (this.mapRegisterAddress(address)) {
      case 0x2000: this.ppu.writeControl(value); break;
      case 0x2001: this.ppu.writeMask(value); break;
      case 0x2003: this.ppu.writeOAMAddress(value); break;
      case 0x2004: this.ppu.writeOAMData(value); break;
      case 0x2005: this.ppu.writeScroll(value); break;
      case 0x2006: this.ppu.writeAddress(value); break;
      case 0x2007: this.ppu.writeData(value); break;
      case 0x4014: this.dma.writeAddress(value); break;
      case 0x4016: this.writeInputDevice(value); break;
      case 0x4000: this.apu.writePulseDutyEnvelope(1, value); break;
      case 0x4001: this.apu.writePulseSweep(1, value); break;
      case 0x4002: this.apu.writePulseTimer(1, value); break;
      case 0x4003: this.apu.writePulseLengthCounter(1, value); break;
      case 0x4004: this.apu.writePulseDutyEnvelope(2, value); break;
      case 0x4005: this.apu.writePulseSweep(2, value); break;
      case 0x4006: this.apu.writePulseTimer(2, value); break;
      case 0x4007: this.apu.writePulseLengthCounter(2, value); break;
      case 0x4008: this.apu.writeTriangleLinearCounter(value); break;
      case 0x400A: this.apu.writeTriangleTimer(value); break;
      case 0x400B: this.apu.writeTriangleLengthCounter(value); break;
      case 0x400C: this.apu.writeNoiseEnvelope(value); break;
      case 0x400E: this.apu.writeNoiseTimer(value); break;
      case 0x400F: this.apu.writeNoiseLengthCounter(value); break;
      case 0x4010: this.apu.writeDMCFlagsTimer(value); break;
      case 0x4011: this.apu.writeDMCOutputLevel(value); break;
      case 0x4012: this.apu.writeDMCSampleAddress(value); break;
      case 0x4013: this.apu.writeDMCSampleLength(value); break;
      case 0x4015: this.apu.writeStatus(value); break;
      case 0x4017:
        this.apu.writeFrameCounter(value);
        this.writeInputDevice(value);
        break;
    }
  }

  mapRegisterAddress(address) {
    if (address < 0x4000) {
      return address & 0x2007; // Mirroring of $2000-$2007 in $2008-$3FFF
    }
    return address;
  }

  //=========================================================
  // Input devices
  //=========================================================

  setInputDevice(port, device) {
    log.info(`${device != null ? 'Setting' : 'Clearing'} device connected to CPU memory on port #${port}`);
    this.inputDevices[port] = device;
  }

  getInputDevice(port) {
    return this.inputDevices[port];
  }

  readInputDevice(port) {
    const device = this.inputDevices[port];
    return device ? device.read() : 0;
  }

  writeInputDevice(value) {
    const strobe = value & 1;
    if (strobe && !this.inputStrobe) {
      this.strobeInputDevice(1);
      this.strobeInputDevice(2);
    }
    this.inputStrobe = strobe;
  }

  strobeInputDevice(port) {
    const device = this.inputDevices[port];
    if (device) {
      device.strobe();
    }
  }

  //=========================================================
  // Expansion ROM ($4020-$5FFF)
  //=========================================================

  readEXROM(address) { // eslint-disable-line no-unused-vars
    return 0; // Not implemented
  }

  writeEXROM(address, value) { // eslint-disable-line no-unused-vars
    // Not implemented
  }

  //=========================================================
  // PRG RAM ($6000-$7FFF)
  //=========================================================

  resetPRGRAM() {
    this.prgRAMMapping = 0;
  }

  readPRGRAM(address) {
    if (this.prgRAM && this.mapper.canReadPRGRAM) {
      return this.prgRAM[this.mapPRGRAMAddress(address)];
    }
    return 0;
  }

  writePRGRAM(address, value) {
    if (this.prgRAM && this.mapper.canWritePRGRAM) {
      this.prgRAM[this.mapPRGRAMAddress(address)] = value;
      if (this.mapper.hasPRGRAMRegisters) {
        this.mapper.write(address, value); // Some mappers have their registers mapped in PRG RAM address space
      }
    }
  }

  mapPRGRAMAddress(address) {
    return this.prgRAMMapping | (address & 0x1FFF);
  }

  mapPRGRAMBank(srcBank, dstBank) {
    this.prgRAMMapping = dstBank * 0x2000; // Only single 8 KB bank
  }

  //=========================================================
  // PRG ROM ($8000-$FFFF)
  //=========================================================

  resetPRGROM() {
    this.prgROMMapping.fill(0);
  }

  readPRGROM(address) {
    return this.prgROM[this.mapPRGROMAddress(address)];
  }

  writePRGROM(address, value) {
    this.mapper.write(address, value); // Writing to mapper registers
  }

  mapPRGROMAddress(address) {
    return this.prgROMMapping[(address & 0x6000) >>> 13] | (address & 0x1FFF);
  }

  mapPRGROMBank(srcBank, dstBank) {
    this.prgROMMapping[srcBank] = dstBank * 0x2000; // 8 KB bank
  }

}
