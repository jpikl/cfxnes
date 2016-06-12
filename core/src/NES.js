import {RESET} from './constants';
import {Region} from './enums';
import {createMapper} from './mappers';
import {BLACK_COLOR, packColor} from './utils';

//=========================================================
// Nintendo Entertainment System
//=========================================================

export default class NES {

  constructor() {
    this.dependencies = ['cpu', 'cpuMemory', 'ppu', 'ppuMemory', 'apu', 'dma'];
  }

  inject(cpu, cpuMemory, ppu, ppuMemory, apu, dma) {
    this.cpu = cpu;
    this.ppu = ppu;
    this.apu = apu;
    this.dma = dma;
    this.cpuMemory = cpuMemory;
    this.ppuMemory = ppuMemory;
  }

  //=========================================================
  // Buttons
  //=========================================================

  pressPower() {
    this.updateRegionParams();
    if (this.cartridge) {
      this.cpuMemory.powerUp();
      this.ppuMemory.powerUp();
      this.mapper.powerUp(); // Must be done after memory
      this.ppu.powerUp();
      this.apu.powerUp();
      this.dma.powerUp();
      this.cpu.powerUp(); // Must be done last
    }
  }

  pressReset() {
    this.cpu.activateInterrupt(RESET);
  }

  //=========================================================
  // Input devices
  //=========================================================

  setInputDevice(port, device) {
    const prevDevice = this.getInputDevice(port);
    if (prevDevice) {
      prevDevice.disconnect();
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
  // Cartridge
  //=========================================================

  insertCartridge(cartridge) {
    this.removeCartridge();
    this.cartridge = cartridge;
    this.mapper = createMapper(cartridge);
    this.mapper.connect(this);
    this.pressPower();
  }

  removeCartridge() {
    if (this.mapper) {
      this.mapper.disconnect();
    }
    this.mapper = null;
    this.cartridge = null;
  }

  getCartridge() {
    return this.cartridge;
  }

  //=========================================================
  // Non-Volatile RAM
  //=========================================================

  getNVRAMSize() {
    return this.cartridge ? this.mapper.getNVRAMSize() : 0;
  }

  getNVRAM() {
    return this.cartridge ? this.mapper.getNVRAM() : null;
  }

  setNVRAM(data) {
    if (this.cartridge) {
      this.mapper.setNVRAM(data);
    }
  }

  //=========================================================
  // Video output
  //=========================================================

  renderFrame(buffer) {
    if (this.cartridge) {
      this.renderNormalFrame(buffer);
    } else {
      this.renderEmptyFrame(buffer);
    }
  }

  renderNormalFrame(buffer) {
    this.ppu.setFrameBuffer(buffer);
    while (!this.ppu.isFrameAvailable()) {
      this.cpu.step();
    }
  }

  renderEmptyFrame(buffer) {
    for (let i = 0; i < buffer.length; i++) {
      const color = ~~(0xFF * Math.random());
      buffer[i] = packColor(color, color, color);
    }
  }

  //=========================================================
  // Video output - debugging
  //=========================================================

  renderDebugFrame(buffer) {
    if (this.cartridge) {
      this.renderNormalDebugFrame(buffer);
    } else {
      this.renderEmptyDebugFrame(buffer);
    }
  }

  renderNormalDebugFrame(buffer) {
    this.ppu.setFrameBuffer(buffer);
    this.ppu.renderDebugFrame();
  }

  renderEmptyDebugFrame(buffer) {
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = BLACK_COLOR;
    }
  }

  //=========================================================
  // Audio output
  //=========================================================

  initAudioRecording(bufferSize) {
    this.apu.initRecording(bufferSize);
  }

  startAudioRecording(sampleRate) {
    this.apu.startRecording(sampleRate);
  }

  stopAudioRecording() {
    this.apu.stopRecording();
  }

  isAudioRecording() {
    return this.apu.isRecording();
  }

  readAudioBuffer() {
    return this.apu.readOutputBuffer();
  }

  setAudioChannelVolume(id, volume) {
    this.apu.setChannelVolume(id, volume);
  }

  getAudioChannelVolume(id) {
    return this.apu.getChannelVolume(id);
  }

  //=========================================================
  // Emulation
  //=========================================================

  step() {
    this.cpu.step();
  }

  //=========================================================
  // Configuration
  //=========================================================

  setPalette(palette) {
    this.ppu.setPalette(palette);
  }

  setRegion(region) {
    this.region = region;
    this.updateRegionParams();
  }

  getRegion() {
    return this.region || this.cartridge && this.cartridge.region || Region.NTSC;
  }

  updateRegionParams() {
    const params = Region.getParams(this.getRegion());
    this.ppu.setRegionParams(params);
    this.apu.setRegionParams(params);
  }

}
