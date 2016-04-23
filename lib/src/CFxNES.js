// jscs:disable disallowQuotedKeysInObjects, requireDotNotation

import Injector from '../../core/src/utils/Injector';
import config from './config';
import logger, {LogLevel} from '../../core/src/utils/logger';
import {channels} from './modules/AudioModule';
import {ports} from './modules/InputModule';

var logLevelAliases = {
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
    var injector = new Injector(config);

    for (var name of ['sha1', 'jszip', 'screenfull']) {
      injector.put(name, {name: name, value: options[name] || null});
    }

    this['audioChannels'] = channels;
    this['inputPorts'] = ports;

    this.systemModule = injector.get('systemModule');
    this.dataModule = injector.get('dataModule');
    this.videoModule = injector.get('videoModule');
    this.audioModule = injector.get('audioModule');
    this.inputModule = injector.get('inputModule');

    this.dataModule.resetOptions();
    this.dataModule.setOptions(options);
    this.videoModule.setCanvas(options['videoOutput'])
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

  ['resetOptions']() {
    this.dataModule.resetOptions();
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

  ['getVideoScale'](scale) {
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

  ['setFullscreenMode'](mode) {
    this.videoModule.setFullscreenMode(mode);
  }

  ['getFullscreenMode']() {
    return this.videoModule.getFullscreenMode();
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

  ['setAudioVolume'](volume) {
    this.audioModule.setVolume(volume);
  }

  ['getAudioVolume']() {
    return this.audioModule.getVolume();
  }

  ['setAudioChannelEnabled'](channel, enabled) {
    this.audioModule.setChannelEnabled(channel, enabled);
  }

  ['isAudioChannelEnabled'](channel) {
    return this.audioModule.isChannelEnabled(channel);
  }

  //=========================================================
  // Input API
  //=========================================================

  ['setInputDevice'](port, id) {
    this.inputModule.connectTarget(port, id);
  }

  ['getInputDevice'](port) {
    return this.inputModule.getConnectedTarget(port);
  }

  ['mapInput'](targetPort, targetId, targetInput, sourceId, sourceInput) {
    this.inputModule.mapInput(targetPort, targetId, targetInput, sourceId, sourceInput);
  }

  ['unmapInput'](targetPort, targetId, targetInput, sourceId, sourceInput) {
    this.inputModule.unmapInput(targetPort, targetId, targetInput, sourceId, sourceInput);
  }

  ['getMappedInputName'](targetPort, targetId, targetInput) {
    return this.inputModule.getMappedInputName(targetPort, targetId, targetInput);
  }

  ['recordInput'](callback) {
    this.inputModule.recordInput(callback);
  }

}

//=========================================================
// Static properties / methods
//=========================================================

CFxNES['version'] = 'unknown'; // Overriden in gulpfile

CFxNES['setLogLevel'] = function(level) {
  logger.setLevel(logLevelAliases[level] || LogLevel.WARN);
};

//=========================================================
// AMD / CommonJS / global export
//=========================================================

if (typeof define === 'function' && define['amd']) {
  define('CFxNES', () => CFxNES);
} else if (typeof module !== 'undefined' && module['exports']) {
  module['exports'] = CFxNES;
} else {
  this['CFxNES'] = CFxNES;
}
