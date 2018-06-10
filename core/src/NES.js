import {log, Region} from './common';
import {CPUMemory, PPUMemory, DMA, createMapper} from './memory';
import {PPU, packColor, BLACK_COLOR} from './video';
import {CPU, Interrupt} from './proc';
import {APU} from './audio';

/**
 * Main component of the emulator.
 * It connects all other components together and provides base emulator API.
 */
export default class NES {

  /**
   * Constructor.
   *
   * @param {!Object=} units Custom implementation of NES internal units.
   */
  constructor(units = {}) {
    log.info('Initializing NES');

    /** @private @const {!Object} CPU. */
    this.cpu = units.cpu || new CPU;
    /** @private @const {!Object} PPU. */
    this.ppu = units.ppu || new PPU;
    /** @private @const {!Object} APU. */
    this.apu = units.apu || new APU;
    /** @private @const {!Object} DMA. */
    this.dma = units.dma || new DMA;
    /** @private @const {!Object} CPU memory. */
    this.cpuMemory = units.cpuMemory || new CPUMemory;
    /** @private @const {!Object} PPU memory. */
    this.ppuMemory = units.ppuMemory || new PPUMemory;

    /** @private {?Object} Currently loaded cartridge. */
    this.cartridge = null;
    /** @private {?Object} Memory mapper for cartridge. */
    this.mapper = null;
    /** @private {?string} Region that overrides auto-detected value from cartridge. */
    this.region = null;

    this.connectUnits();
    this.applyRegion();
  }

  /**
   * Connects all units to NES.
   *
   * @private
   */
  connectUnits() {
    this.cpu.connect(this);
    this.ppu.connect(this);
    this.apu.connect(this);
    this.dma.connect(this);
    this.cpuMemory.connect(this);
  }

  /**
   * Resets all units to their initial state.
   *
   * @private
   */
  resetUnits() {
    this.cpuMemory.reset();
    this.ppuMemory.reset();
    this.mapper.reset(); // Must be done after memory
    this.ppu.reset();
    this.apu.reset();
    this.dma.reset();
    this.cpu.reset(); // Must be done last
  }

  /**
   * Performs HW reset.
   * Equivalent of NES power button.
   */
  power() {
    if (this.cartridge) {
      this.resetUnits();
    }
  }

  /**
   * Performs SW reset.
   * Equivalent of NES reset button.
   */
  reset() {
    this.cpu.activateInterrupt(Interrupt.RESET);
  }

  /**
   * Sets region that will override auto-detected value from cartridge.
   *
   * @param {?string} region Region or null to enable its auto-detection.
   */
  setRegion(region) {
    this.region = region;
    this.applyRegion();
  }

  /**
   * Returns enforced region.
   *
   * @returns {?string} Region o null if its auto-detection is enabled.
   */
  getRegion() {
    return this.region;
  }

  /**
   * Returns region that is actually being emulated.
   *
   * This will be either:
   *   1. Region enforced through setRegion call.
   *   2. Region auto-detected from cartridge.
   *   3. NTSC region (fallback).
   *
   * @returns {string} Region.
   */
  getUsedRegion() {
    return this.region || (this.cartridge && this.cartridge.region) || Region.NTSC;
  }

  /**
   * Applies parameters of the currently used region to emulator components.
   *
   * @private
   */
  applyRegion() {
    log.info('Updating region parameters');
    const region = this.getUsedRegion();
    const params = Region.getParams(region);

    log.info(`Detected region: "${region}"`);
    this.ppu.setRegionParams(params);
    this.apu.setRegionParams(params);
  }

  /**
   * Loads cartridge.
   *
   * Setting non-null value will:
   *   1. Remove the current cartridge.
   *   2. Insert the new one.
   *   3. Perform HW reset.
   *
   * Setting null value will only remove the current cartridge.
   *
   * @param {?Object} cartridge Cartridge or null.
   */
  setCartridge(cartridge) {
    if (this.cartridge) {
      this.removeCartridge();
    }
    if (cartridge) {
      this.insertCartridge(cartridge);
      this.power();
    }
  }

  /**
   * Removes the current cartridge.
   *
   * @private
   */
  removeCartridge() {
    log.info('Removing current cartridge');
    if (this.mapper) { // Does not have to be present in case of error during mapper creation.
      this.mapper.disconnect();
      this.mapper = null;
    }
    this.cartridge = null;
  }

  /**
   * Inserts new cartridge.
   *
   * @private
   * @param {!Object} cartridge Cartridge.
   */
  insertCartridge(cartridge) {
    log.info('Inserting cartridge');
    this.cartridge = cartridge;
    this.mapper = createMapper(cartridge);
    this.mapper.connect(this);
    this.applyRegion();
  }

  /**
   * Returns the currently loaded cartridge.
   *
   * @returns {?Object} Cartridge or null if none is loaded.
   */
  getCartridge() {
    return this.cartridge;
  }

  /**
   * Sets input device connected to a port.
   *
   * @param {number} port Port number.
   * @param {?Object} device Device or null.
   */
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

  /**
   * Returns input device connected to a port.
   *
   * @param {number} port Port number.
   * @returns {?Object} Device or null.
   */
  getInputDevice(port) {
    return this.cpuMemory.getInputDevice(port);
  }

  /**
   * Sets color palette used for video rendering.
   *
   * @param {!Uint32Array} palette Palette of 64 colors.
   */
  setPalette(palette) {
    this.ppu.setBasePalette(palette);
  }

  /**
   * Returns color palette used for video rendering.
   *
   * @returns {?Uint32Array} Palette of 64 colors.
   */
  getPalette() {
    return this.ppu.getBasePalette();
  }

  /**
   * Emulates one frame and renders it into provided buffer.
   * In case there is no loaded cartridge, it renders only white noise.
   *
   * @param {!Uint32Array} buffer Buffer of length 320 * 240.
   */
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

  /**
   * Renders frame containing debugging information into provided buffer.
   * The debugging information consists of currently loaded patterns
   * and palettes. In case there is no loaded cartridge, it fills the
   * buffer with black color.
   *
   * @param {!Uint32Array} buffer Buffer of length 320 * 240.
   */
  renderDebugFrame(buffer) {
    if (this.cartridge) {
      this.ppu.setFrameBuffer(buffer);
      this.ppu.renderDebugFrame();
    } else {
      this.renderEmptyFrame(buffer);
    }
  }

  /**
   * Renders white noise into provided buffer.
   *
   * @private
   * @param {!Uint32Array} buffer Buffer of length 320 * 240.
   */
  renderWhiteNoise(buffer) {
    for (let i = 0; i < buffer.length; i++) {
      const color = ~~(0xFF * Math.random());
      buffer[i] = packColor(color, color, color);
    }
  }

  /**
   * Fills provided buffer with black color.
   *
   * @private
   * @param {!Uint32Array} buffer Buffer of length 320 * 240.
   */
  renderEmptyFrame(buffer) {
    buffer.fill(BLACK_COLOR);
  }

  /**
   * Sets rate of generated audio samples.
   *
   * @param {number} rate Number of samples per second.
   */
  setAudioSampleRate(rate) {
    this.apu.setSampleRate(rate);
  }

  /**
   * Returns rate of generated audio samples.
   *
   * @returns {number} Number of samples per second.
   */
  getAudioSampleRate() {
    return this.apu.getSampleRate();
  }

  /**
   * Sets callback that will consume generated audio samples.
   * Setting null will disable generation of audio samples.
   *
   * @param {?function(number)} callback Callback or null.
   */
  setAudioCallback(callback) {
    this.apu.setCallback(callback);
  }

  /**
   * Returns callback that consumes generated audio samples.
   *
   * @returns {?function(number)} Callback or null.
   */
  getAudioCallback() {
    return this.apu.getCallback();
  }

  /**
   * Sets volume of an audio channel.
   *
   * @param {number} channel Channel number (0 - 4).
   * @param {number} volume Volume (0.0 - 1.0).
   */
  setAudioVolume(channel, volume) {
    this.apu.setVolume(channel, volume);
  }

  /**
   * Returns volume of an audio channel.
   *
   * @param {number} channel Channel number (0 - 4).
   * @returns {number} Volume (0.0 - 1.0).
   */
  getAudioVolume(channel) {
    return this.apu.getVolume(channel);
  }

  /**
   * Returns Non-volatile RAM (NVRAM).
   * Modifications to the returned array will affect contents of NVRAM.
   *
   * @return {?Uint8Array} Array or null if NVRAM is not present.
   */
  getNVRAM() {
    return this.mapper ? this.mapper.getNVRAM() : null;
  }

}
