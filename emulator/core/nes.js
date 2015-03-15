var Interrupt, NES, TVSystem, colors;

Interrupt = require("./common/types").Interrupt;

TVSystem = require("./common/types").TVSystem;

colors = require("./utils/colors");

NES = (function() {
  function NES() {}

  NES.dependencies = ["cpu", "cpuMemory", "ppu", "ppuMemory", "apu", "dma", "mapperFactory"];

  NES.prototype.init = function(cpu, cpuMemory, ppu, ppuMemory, apu, dma, mapperFactory) {
    this.cpu = cpu;
    this.ppu = ppu;
    this.apu = apu;
    this.dma = dma;
    this.cpuMemory = cpuMemory;
    this.ppuMemory = ppuMemory;
    return this.mapperFactory = mapperFactory;
  };

  NES.prototype.pressPower = function() {
    if (this.isCartridgeInserted()) {
      this.mapper.powerUp();
      this.dma.powerUp();
      this.apu.powerUp();
      this.ppuMemory.powerUp();
      this.ppu.powerUp();
      this.cpuMemory.powerUp();
      return this.cpu.powerUp();
    }
  };

  NES.prototype.pressReset = function() {
    return this.cpu.activateInterrupt(Interrupt.RESET);
  };

  NES.prototype.connectInputDevice = function(port, device) {
    return this.cpuMemory.setInputDevice(port, device);
  };

  NES.prototype.getConnectedInputDevice = function(port) {
    return this.cpuMemory.getInputDevice(port);
  };

  NES.prototype.insertCartridge = function(cartridge) {
    this.cartridge = cartridge;
    this.mapper = this.mapperFactory.createMapper(cartridge);
    this.cpu.connectMapper(this.mapper);
    this.ppu.connectMapper(this.mapper);
    this.cpuMemory.connectMapper(this.mapper);
    this.ppuMemory.connectMapper(this.mapper);
    this.updateTVSystem();
    return this.pressPower();
  };

  NES.prototype.isCartridgeInserted = function() {
    return this.cartridge != null;
  };

  NES.prototype.removeCartridge = function() {
    return this.cartridge = null;
  };

  NES.prototype.loadCartridgeData = function(storage) {
    var ref, ref1;
    if ((ref = this.mapper) != null) {
      ref.loadPRGRAM(storage);
    }
    return (ref1 = this.mapper) != null ? ref1.loadCHRRAM(storage) : void 0;
  };

  NES.prototype.saveCartridgeData = function(storage) {
    var ref, ref1;
    if ((ref = this.mapper) != null) {
      ref.savePRGRAM(storage);
    }
    return (ref1 = this.mapper) != null ? ref1.saveCHRRAM(storage) : void 0;
  };

  NES.prototype.renderFrame = function(buffer) {
    if (this.isCartridgeInserted()) {
      return this.renderNormalFrame(buffer);
    } else {
      return this.renderEmptyFrame(buffer);
    }
  };

  NES.prototype.renderNormalFrame = function(buffer) {
    var results;
    this.ppu.startFrame(buffer);
    results = [];
    while (!this.ppu.isFrameAvailable()) {
      results.push(this.cpu.step());
    }
    return results;
  };

  NES.prototype.renderEmptyFrame = function(buffer) {
    var i, j, ref;
    for (i = j = 0, ref = buffer.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      var color = 0xFF * Math.random();
      buffer[i] = colors.pack(color, color, color);
    }
    return void 0;
  };

  NES.prototype.renderDebugFrame = function(buffer) {
    if (this.isCartridgeInserted()) {
      return this.renderNormalDebugFrame(buffer);
    } else {
      return this.renderEmptyDebugFrame(buffer);
    }
  };

  NES.prototype.renderNormalDebugFrame = function(buffer) {
    this.ppu.startFrame(buffer);
    return this.ppu.renderDebugFrame();
  };

  NES.prototype.renderEmptyDebugFrame = function(buffer) {
    var i, j, ref;
    for (i = j = 0, ref = buffer.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      buffer[i] = colors.BLACK;
    }
    return void 0;
  };

  NES.prototype.initAudioRecording = function(bufferSize) {
    return this.apu.initRecording(bufferSize);
  };

  NES.prototype.startAudioRecording = function(sampleRate) {
    return this.apu.startRecording(sampleRate);
  };

  NES.prototype.stopAudioRecording = function() {
    return this.apu.stopRecording();
  };

  NES.prototype.readAudioBuffer = function() {
    return this.apu.readOutputBuffer();
  };

  NES.prototype.setChannelEnabled = function(id, enabled) {
    return this.apu.setChannelEnabled(id, enabled);
  };

  NES.prototype.isChannelEnabled = function(id) {
    return this.apu.isChannelEnabled(id);
  };

  NES.prototype.step = function() {
    return this.cpu.step();
  };

  NES.prototype.setRGBAPalette = function(rgbaData) {
    return this.ppu.setRGBAPalette(rgbaData);
  };

  NES.prototype.setTVSystem = function(tvSystem) {
    this.tvSystem = tvSystem;
    return this.updateTVSystem();
  };

  NES.prototype.getTVSystem = function() {
    var ref;
    return this.tvSystem || ((ref = this.cartridge) != null ? ref.tvSystem : void 0) || TVSystem.NTSC;
  };

  NES.prototype.updateTVSystem = function() {
    var ntscMode;
    ntscMode = this.getTVSystem() === TVSystem.NTSC;
    this.ppu.setNTSCMode(ntscMode);
    return this.apu.setNTSCMode(ntscMode);
  };

  return NES;

})();

module.exports = NES;
