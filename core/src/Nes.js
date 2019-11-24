import {log, Region} from './common';
import {CpuMemory, PpuMemory, Dma, createMapper} from './memory';
import {Ppu, packColor, BLACK_COLOR} from './video';
import {Cpu, Interrupt} from './proc';
import {Apu} from './audio';

export default class Nes {

  constructor(units = {}) {
    log.info('Initializing NES');

    this.cpu = units.cpu || new Cpu;
    this.ppu = units.ppu || new Ppu;
    this.apu = units.apu || new Apu;
    this.dma = units.dma || new Dma;
    this.cpuMemory = units.cpuMemory || new CpuMemory;
    this.ppuMemory = units.ppuMemory || new PpuMemory;

    this.cartridge = null;
    this.mapper = null;
    this.region = null;

    this.connectUnits();
    this.applyRegion();
  }

  //=========================================================
  // Units
  //=========================================================

  connectUnits() {
    this.cpu.connect(this);
    this.ppu.connect(this);
    this.apu.connect(this);
    this.dma.connect(this);
    this.cpuMemory.connect(this);
  }

  resetUnits() {
    this.cpuMemory.reset();
    this.ppuMemory.reset();
    this.mapper.reset(); // Must be done after memory
    this.ppu.reset();
    this.apu.reset();
    this.dma.reset();
    this.cpu.reset(); // Must be done last
  }

  //=========================================================
  // Region
  //=========================================================

  setRegion(region) {
    this.region = region;
    this.applyRegion();
  }

  getRegion() {
    return this.region;
  }

  getUsedRegion() {
    return this.region || (this.cartridge && this.cartridge.region) || Region.NTSC;
  }

  applyRegion() {
    log.info('Updating region parameters');
    const region = this.getUsedRegion();
    const params = Region.getParams(region);

    log.info(`Detected region: "${region}"`);
    this.ppu.setRegionParams(params);
    this.apu.setRegionParams(params);
  }

  //=========================================================
  // Cartridge
  //=========================================================

  setCartridge(cartridge) {
    if (this.cartridge) {
      log.info('Removing current cartridge');
      if (this.mapper) { // Does not have to be present in case of error during mapper creation.
        this.mapper.disconnect();
        this.mapper = null;
      }
      this.cartridge = null;
    }
    if (cartridge) {
      log.info('Inserting cartridge');
      this.cartridge = cartridge;
      this.mapper = createMapper(cartridge);
      this.mapper.connect(this);
      this.applyRegion();
      this.power();
    }
  }

  getCartridge() {
    return this.cartridge;
  }

  //=========================================================
  // Reset
  //=========================================================

  power() {
    if (this.cartridge) {
      this.resetUnits();
    }
  }

  reset() {
    this.cpu.activateInterrupt(Interrupt.RESET);
  }

  //=========================================================
  // Input devices
  //=========================================================

  setInputDevice(port, device) {
    const oldDevice = this.cpuMemory.getInputDevice(port);
    if (oldDevice) {
      oldDevice.disconnect();
    }
    this.cpuMemory.setInputDevice(port, device);
    if (device) {
      device.connect(this);
    }
  }

  getInputDevice(port) {
    return this.cpuMemory.getInputDevice(port);
  }

  //=========================================================
  // Video output
  //=========================================================

  setPalette(palette) {
    this.ppu.setBasePalette(palette);
  }

  getPalette() {
    return this.ppu.getBasePalette();
  }

  renderFrame(buffer) {
    if (this.cartridge) {
      this.ppu.setFrameBuffer(buffer);
      while (!this.ppu.isFrameAvailable()) {
        this.cpu.step();
      }
    } else {
      this.renderWhiteNoise(buffer);
    }
  }

  renderDebugFrame(buffer) {
    if (this.cartridge) {
      this.ppu.setFrameBuffer(buffer);
      this.ppu.renderDebugFrame();
    } else {
      this.renderEmptyFrame(buffer);
    }
  }

  renderWhiteNoise(buffer) {
    for (let i = 0; i < buffer.length; i++) {
      const color = ~~(0xFF * Math.random());
      buffer[i] = packColor(color, color, color);
    }
  }

  renderEmptyFrame(buffer) {
    buffer.fill(BLACK_COLOR);
  }

  //=========================================================
  // Audio output
  //=========================================================

  setAudioSampleRate(rate) {
    this.apu.setSampleRate(rate);
  }

  getAudioSampleRate() {
    return this.apu.getSampleRate();
  }

  setAudioCallback(callback) {
    this.apu.setCallback(callback);
  }

  getAudioCallback() {
    return this.apu.getCallback();
  }

  setAudioVolume(channel, volume) {
    this.apu.setVolume(channel, volume);
  }

  getAudioVolume(channel) {
    return this.apu.getVolume(channel);
  }

  //=========================================================
  // Non-volatile RAM
  //=========================================================

  getNVRam() {
    return this.mapper ? this.mapper.getNVRam() : null;
  }

}
