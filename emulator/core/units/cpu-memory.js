import { logger }        from "../utils/logger";
import { newUint8Array } from "../utils/system";

export function CPUMemory() {}

CPUMemory["dependencies"] = [ "ppu", "apu", "dma" ];

CPUMemory.prototype.init = function(ppu, apu, dma) {
  this.ppu = ppu;
  this.apu = apu;
  this.dma = dma;
  return this.inputDevices = {
    1: null,
    2: null
  };
};

CPUMemory.prototype.powerUp = function() {
  logger.info("Reseting CPU memory");
  this.createRAM();
  return this.resetIO();
};

CPUMemory.prototype.read = function(address) {
  if (address >= 0x8000) {
    return this.readPRGROM(address);
  } else if (address < 0x2000) {
    return this.readRAM(address);
  } else if (address < 0x4020) {
    return this.readIO(address);
  } else if (address >= 0x6000) {
    return this.readPRGRAM(address);
  } else {
    return this.readEXROM(address);
  }
};

CPUMemory.prototype.write = function(address, value) {
  if (address >= 0x8000) {
    this.writePRGROM(address, value);
  } else if (address < 0x2000) {
    this.writeRAM(address, value);
  } else if (address < 0x4020) {
    this.writeIO(address, value);
  } else if (address >= 0x6000) {
    this.writePRGRAM(address, value);
  } else {
    this.writeEXROM(address, value);
  }
  return value;
};

CPUMemory.prototype.createRAM = function() {
  this.ram = newUint8Array(0x800);
  return void 0;
};

CPUMemory.prototype.readRAM = function(address) {
  return this.ram[this.mapRAMAddress(address)];
};

CPUMemory.prototype.writeRAM = function(address, value) {
  return this.ram[this.mapRAMAddress(address)] = value;
};

CPUMemory.prototype.mapRAMAddress = function(address) {
  return address & 0x07FF;
};

CPUMemory.prototype.resetIO = function() {
  return this.inputDevicesStrobe = 0;
};

CPUMemory.prototype.readIO = function(address) {
  switch (this.mapIOAddress(address)) {
    case 0x2002:
      return this.ppu.readStatus();
    case 0x2004:
      return this.ppu.readOAMData();
    case 0x2007:
      return this.ppu.readData();
    case 0x4015:
      return this.apu.readStatus();
    case 0x4016:
      return this.readInputDevice(1);
    case 0x4017:
      return this.readInputDevice(2);
    default:
      return 0;
  }
};

CPUMemory.prototype.writeIO = function(address, value) {
  switch (this.mapIOAddress(address)) {
    case 0x2000:
      return this.ppu.writeControl(value);
    case 0x2001:
      return this.ppu.writeMask(value);
    case 0x2003:
      return this.ppu.writeOAMAddress(value);
    case 0x2004:
      return this.ppu.writeOAMData(value);
    case 0x2005:
      return this.ppu.writeScroll(value);
    case 0x2006:
      return this.ppu.writeAddress(value);
    case 0x2007:
      return this.ppu.writeData(value);
    case 0x4014:
      return this.dma.writeAddress(value);
    case 0x4016:
      return this.writeInputDevice(value);
    case 0x4000:
      return this.apu.writePulseDutyEnvelope(1, value);
    case 0x4001:
      return this.apu.writePulseSweep(1, value);
    case 0x4002:
      return this.apu.writePulseTimer(1, value);
    case 0x4003:
      return this.apu.writePulseLengthCounter(1, value);
    case 0x4004:
      return this.apu.writePulseDutyEnvelope(2, value);
    case 0x4005:
      return this.apu.writePulseSweep(2, value);
    case 0x4006:
      return this.apu.writePulseTimer(2, value);
    case 0x4007:
      return this.apu.writePulseLengthCounter(2, value);
    case 0x4008:
      return this.apu.writeTriangleLinearCounter(value);
    case 0x400A:
      return this.apu.writeTriangleTimer(value);
    case 0x400B:
      return this.apu.writeTriangleLengthCounter(value);
    case 0x400C:
      return this.apu.writeNoiseEnvelope(value);
    case 0x400E:
      return this.apu.writeNoiseTimer(value);
    case 0x400F:
      return this.apu.writeNoiseLengthCounter(value);
    case 0x4010:
      return this.apu.writeDMCFlagsTimer(value);
    case 0x4011:
      return this.apu.writeDMCOutputLevel(value);
    case 0x4012:
      return this.apu.writeDMCSampleAddress(value);
    case 0x4013:
      return this.apu.writeDMCSampleLength(value);
    case 0x4015:
      return this.apu.writeStatus(value);
    case 0x4017:
      this.apu.writeFrameCounter(value);
      return this.writeInputDevice(value);
    default:
      return value;
  }
};

CPUMemory.prototype.mapIOAddress = function(address) {
  if (address < 0x4000) {
    return address & 0x2007;
  } else {
    return address;
  }
};

CPUMemory.prototype.setInputDevice = function(port, device) {
  return this.inputDevices[port] = device;
};

CPUMemory.prototype.getInputDevice = function(port) {
  return this.inputDevices[port];
};

CPUMemory.prototype.readInputDevice = function(port) {
  var ref;
  return ((ref = this.inputDevices[port]) != null ? ref.read() : void 0) || 0;
};

CPUMemory.prototype.writeInputDevice = function(value) {
  var ref, ref1, strobe;
  strobe = value & 1;
  if (strobe && !this.inputDevicesStrobe) {
    if ((ref = this.inputDevices[1]) != null) {
      ref.strobe();
    }
    if ((ref1 = this.inputDevices[2]) != null) {
      ref1.strobe();
    }
  }
  this.inputDevicesStrobe = strobe;
  return value;
};

CPUMemory.prototype.readEXROM = function(address) {
  return 0;
};

CPUMemory.prototype.writeEXROM = function(address, value) {
  return value;
};

CPUMemory.prototype.resetPRGRAM = function(mapper) {
  this.prgRAM = mapper.prgRAM;
  return this.prgRAMMapping = null;
};

CPUMemory.prototype.readPRGRAM = function(address) {
  if (this.prgRAM) {
    return this.prgRAM[this.mapPRGRAMAddress(address)];
  } else {
    return 0;
  }
};

CPUMemory.prototype.writePRGRAM = function(address, value) {
  if (this.prgRAM) {
    return this.prgRAM[this.mapPRGRAMAddress(address)] = value;
  } else {
    return value;
  }
};

CPUMemory.prototype.mapPRGRAMAddress = function(address) {
  return this.prgRAMMapping | address & 0x1FFF;
};

CPUMemory.prototype.mapPRGRAMBank = function(srcBank, dstBank) {
  return this.prgRAMMapping = dstBank * 0x2000;
};

CPUMemory.prototype.resetPRGROM = function(mapper) {
  this.writeMapper = mapper.write.bind(mapper);
  this.prgROM = mapper.prgROM;
  return this.prgROMMapping = [];
};

CPUMemory.prototype.readPRGROM = function(address) {
  return this.prgROM[this.mapPRGROMAddress(address)];
};

CPUMemory.prototype.writePRGROM = function(address, value) {
  return this.writeMapper(address, value);
};

CPUMemory.prototype.mapPRGROMAddress = function(address) {
  return this.prgROMMapping[address & 0x6000] | address & 0x1FFF;
};

CPUMemory.prototype.mapPRGROMBank = function(srcBank, dstBank) {
  return this.prgROMMapping[srcBank * 0x2000] = dstBank * 0x2000;
};

CPUMemory.prototype.connectMapper = function(mapper) {
  this.resetPRGROM(mapper);
  return this.resetPRGRAM(mapper);
};
