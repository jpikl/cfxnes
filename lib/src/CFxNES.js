import logger, {LogLevel} from '../../core/src/utils/logger';
import Injector from '../../core/src/utils/Injector';
import config from './config';

const logLevelIds = {
  'off': LogLevel.OFF,
  'error': LogLevel.ERROR,
  'warn': LogLevel.WARN,
  'info': LogLevel.INFO,
  'all': LogLevel.ALL,
};

//=========================================================
// CFxNES API
//=========================================================

export default class CFxNES {

  constructor(options = {}) {
    const injector = new Injector(config);

    for (const name of ['sha1', 'JSZip', 'screenfull']) {
      injector.put(name, {value: options[name] || null});
    }

    this.systemModule = injector.get('systemModule');
    this.dataModule = injector.get('dataModule');
    this.videoModule = injector.get('videoModule');
    this.audioModule = injector.get('audioModule');
    this.inputModule = injector.get('inputModule');

    this.dataModule.resetOptions();
    this.dataModule.setOptions(options);
    this.videoModule.setCanvas(options['videoOutput']);
  }

  //=========================================================
  // System API
  //=========================================================

  ['start']() {
    this.systemModule.start();
  }

  ['stop']() {
    this.systemModule.stop();
  }

  ['step']() {
    this.systemModule.step();
  }

  ['isRunning']() {
    return this.systemModule.isRunning();
  }

  ['hardReset']() {
    this.systemModule.hardReset();
  }

  ['softReset']() {
    this.systemModule.softReset();
  }

  ['getSpeed']() {
    return this.systemModule.getSpeed();
  }

  ['setSpeed'](speed) {
    this.systemModule.setSpeed(speed);
  }

  ['getRegion']() {
    return this.systemModule.getRegion();
  }

  ['setRegion'](region) {
    this.systemModule.setRegion(region);
  }

  ['getFPS']() {
    return this.systemModule.getFPS();
  }

  //=========================================================
  // Data API
  //=========================================================

  ['loadROM'](source) {
    return this.dataModule.loadROM(source);
  }

  ['unloadROM']() {
    this.dataModule.unloadROM();
  }

  ['isROMLoaded']() {
    return this.dataModule.isROMLoaded();
  }

  ['getNVRAMSize']() {
    return this.dataModule.getNVRAMSize();
  }

  ['getNVRAM']() {
    return this.dataModule.getNVRAM();
  }

  ['setNVRAM'](data) {
    this.dataModule.setNVRAM(data);
  }

  ['loadNVRAM']() {
    return this.dataModule.loadNVRAM();
  }

  ['saveNVRAM']() {
    return this.dataModule.saveNVRAM();
  }

  ['deleteNVRAMs']() {
    return this.dataModule.deleteNVRAMs();
  }

  ['getOptions']() {
    return this.dataModule.getOptions();
  }

  ['setOptions'](options) {
    this.dataModule.setOptions(options);
  }

  ['resetOptions'](...options) {
    this.dataModule.resetOptions(...options);
  }

  ['loadOptions']() {
    this.dataModule.loadOptions();
  }

  ['saveOptions']() {
    this.dataModule.saveOptions();
  }

  ['deleteOptions']() {
    this.dataModule.deleteOptions();
  }

  //=========================================================
  // Video API
  //=========================================================

  ['setVideoOutput'](canvas) {
    this.videoModule.setCanvas(canvas);
  }

  ['getVideoOutput']() {
    return this.videoModule.getCanvas();
  }

  ['setVideoRenderer'](renderer) {
    this.videoModule.setRenderer(renderer);
  }

  ['getVideoRenderer']() {
    return this.videoModule.getRenderer();
  }

  ['isVideoRendererSupported'](renderer) {
    return this.videoModule.isRendererSupported(renderer);
  }

  ['setVideoPalette'](palette) {
    this.videoModule.setPalette(palette);
  }

  ['getVideoPalette']() {
    return this.videoModule.getPalette();
  }

  ['setVideoScale'](scale) {
    this.videoModule.setScale(scale);
  }

  ['getVideoScale']() {
    return this.videoModule.getScale();
  }

  ['getMaxVideoScale']() {
    return this.videoModule.getMaxScale();
  }

  ['setVideoSmoothing'](smoothing) {
    this.videoModule.setSmoothing(smoothing);
  }

  ['isVideoSmoothing']() {
    return this.videoModule.isSmoothing();
  }

  ['setVideoDebugging'](debugging) {
    this.videoModule.setDebugging(debugging);
  }

  ['isVideoDebugging']() {
    return this.videoModule.isDebugging();
  }

  ['enterFullscreen']() {
    this.videoModule.enterFullscreen();
  }

  ['setFullscreenType'](type) {
    this.videoModule.setFullscreenType(type);
  }

  ['getFullscreenType']() {
    return this.videoModule.getFullscreenType();
  }

  //=========================================================
  // Audio API
  //=========================================================

  ['isAudioSupported']() {
    return this.audioModule.isSupported();
  }

  ['setAudioEnabled'](enabled) {
    this.audioModule.setEnabled(enabled);
  }

  ['isAudioEnabled']() {
    return this.audioModule.isEnabled();
  }

  ['setAudioVolume'](channel, volume) {
    if (typeof channel === 'number') {
      this.audioModule.setMasterVolume(channel);
    } else if (channel === 'master') {
      this.audioModule.setMasterVolume(volume);
    } else {
      this.audioModule.setChannelVolume(channel, volume);
    }
  }

  ['getAudioVolume'](channel) {
    if (channel == null || channel === 'master') {
      return this.audioModule.getMasterVolume();
    }
    return this.audioModule.getChannelVolume(channel);
  }

  //=========================================================
  // Input API
  //=========================================================

  ['setInputDevice'](port, device) {
    this.inputModule.setDevice(port, device);
  }

  ['getInputDevice'](port) {
    return this.inputModule.getDevice(port);
  }

  ['mapInputs'](deviceInput, sourceInputs) {
    this.inputModule.mapInputs(deviceInput, sourceInputs);
  }

  ['unmapInputs'](...inputs) {
    this.inputModule.unmapInputs(...inputs);
  }

  ['getMappedInputs'](input) {
    return this.inputModule.getMappedInputs(input);
  }

  ['recordInput'](callback) {
    this.inputModule.recordInput(callback);
  }

}

//=========================================================
// Static properties / methods
//=========================================================

CFxNES['version'] = 'unknown'; // Updated through gulpfile

CFxNES['setLogLevel'] = function(level) {
  logger.setLevel(logLevelIds[level] || LogLevel.WARN);
};

//=========================================================
// AMD / CommonJS / global export
//=========================================================

/* eslint-env amd */
/* eslint-disable no-invalid-this */

if (typeof define === 'function' && define['amd']) {
  define('CFxNES', () => CFxNES);
} else if (typeof module !== 'undefined' && module['exports']) {
  module['exports'] = CFxNES;
} else {
  this['CFxNES'] = CFxNES;
}
