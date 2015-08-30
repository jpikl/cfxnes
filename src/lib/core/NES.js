import Region from './common/Region';
import { RESET } from './common/constants';
import { BLACK_COLOR, packColor } from './utils/colors';

//=========================================================
// Nintendo Entertainment System
//=========================================================

export default class NES {

  constructor() {
    this.dependencies = ['cpu', 'cpuMemory', 'ppu', 'ppuMemory', 'apu', 'dma', 'mapperFactory'];
  }

  inject(cpu, cpuMemory, ppu, ppuMemory, apu, dma, mapperFactory) {
    this.cpu = cpu;
    this.ppu = ppu;
    this.apu = apu;
    this.dma = dma;
    this.cpuMemory = cpuMemory;
    this.ppuMemory = ppuMemory;
    this.mapperFactory = mapperFactory;
  }

  //=========================================================
  // Buttons
  //=========================================================

  pressPower() {
    this.updateRegionParams();
    if (this.isCartridgeInserted()) {
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

  connectInputDevice(port, device) {
    this.cpuMemory.setInputDevice(port, device);
  }

  getConnectedInputDevice(port) {
    return this.cpuMemory.getInputDevice(port);
  }

  //=========================================================
  // Cartridge
  //=========================================================

  insertCartridge(cartridge) {
    this.cartridge = cartridge;
    this.mapper = this.mapperFactory.createMapper(cartridge);
    this.cpu.connectMapper(this.mapper);
    this.ppu.connectMapper(this.mapper);
    this.cpuMemory.connectMapper(this.mapper);
    this.ppuMemory.connectMapper(this.mapper);
    this.pressPower();
  }

  isCartridgeInserted() {
    return this.cartridge != null;
  }

  removeCartridge() {
    this.cartridge = null;
  }

  loadCartridgeData(storage) {
    if (this.mapper) {
      return Promise.all([
      this.mapper.loadPRGRAM(storage),
      this.mapper.loadCHRRAM(storage),
      ]);
    }
    return Promise.resolve();
  }

  saveCartridgeData(storage) {
    if (this.mapper) {
      return Promise.all([
        this.mapper.savePRGRAM(storage),
        this.mapper.saveCHRRAM(storage),
      ]);
    }
    return Promise.resolve();
  }

  //=========================================================
  // Video output
  //=========================================================

  renderFrame(buffer) {
    if (this.isCartridgeInserted()) {
      this.renderNormalFrame(buffer);
    } else {
      this.renderEmptyFrame(buffer);
    }
  }

  renderNormalFrame(buffer) {
    this.ppu.startFrame(buffer);
    while (!this.ppu.isFrameAvailable()) {
      this.cpu.step();
    }
  }

  renderEmptyFrame(buffer) {
    for (var i = 0; i < buffer.length; i++) {
      var color = ~~(0xFF * Math.random());
      buffer[i] = packColor(color, color, color);
    }
  }

  //=========================================================
  // Video output - debugging
  //=========================================================

  renderDebugFrame(buffer) {
    if (this.isCartridgeInserted()) {
      this.renderNormalDebugFrame(buffer);
    } else {
      this.renderEmptyDebugFrame(buffer);
    }
  }

  renderNormalDebugFrame(buffer) {
    this.ppu.startFrame(buffer);
    this.ppu.renderDebugFrame();
  }

  renderEmptyDebugFrame(buffer) {
    for (var i = 0; i < buffer.length; i++) {
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

  readAudioBuffer() {
    return this.apu.readOutputBuffer();
  }

  setChannelEnabled(id, enabled) {
    this.apu.setChannelEnabled(id, enabled);
  }

  isChannelEnabled(id) {
    return this.apu.isChannelEnabled(id);
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
    return this.region || this.cartridge && this.cartridge.region;
  }

  updateRegionParams() {
    var params = Region.getParams(this.getRegion());
    this.ppu.setRegionParams(params);
    this.apu.setRegionParams(params);
  }

}
