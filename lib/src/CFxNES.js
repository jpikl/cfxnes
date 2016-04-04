// jscs:disable disallowQuotedKeysInObjects, requireDotNotation

import Injector from '../../core/src/utils/Injector';
import baseInjectorConfig from './config';
import logger, { LogLevel } from '../../core/src/utils/logger';
import { channels } from './managers/AudioManager';
import { ports } from './managers/InputManager';
import { copyProperties } from '../../core/src/utils/objects';

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

  constructor(config = {}) {
    this.dependencies = [
      'executionManager',
      'cartridgeManager',
      'videoManager',
      'audioManager',
      'inputManager',
      'persistenceManager',
    ];
    this.bootstrap(config);
    this.init(config);
  }

  bootstrap(config) {
    var injectorConfig = copyProperties(baseInjectorConfig);
    for (var name of ['hash', 'jszip', 'screenfull']) {
      injectorConfig[name].value = config[name] || null;
    }
    new Injector(injectorConfig).inject(this);
  }

  inject(executionManager, cartridgeManager, videoManager, audioManager, inputManager, persistenceManager) {
    this['audioChannels'] = channels;
    this['inputPorts'] = ports;
    this.executionManager = executionManager;
    this.cartridgeManager = cartridgeManager;
    this.videoManager = videoManager;
    this.audioManager = audioManager;
    this.inputManager = inputManager;
    this.persistenceManager = persistenceManager;
  }

  init(config) {
    this['writeConfiguration'](config);
    if (config['storage']) {
      this['setStorage'](config['storage']);
    }
    if (config['videoOutput']) {
      this['setVideoOutput'](config['videoOutput']);
    }
  }

  //=========================================================
  // General API
  //=========================================================

  ['setDefaults']() {
    this.executionManager.setDefaults();
    this.videoManager.setDefaults();
    this.audioManager.setDefaults();
    this.inputManager.setDefaults();
  }

  ['start']() {
    this.executionManager.start();
  }

  ['stop']() {
    this.executionManager.stop();
  }

  ['step']() {
    this.executionManager.step();
  }

  ['isRunning']() {
    return this.executionManager.isRunning();
  }

  ['hardReset']() {
    this.executionManager.hardReset();
  }

  ['softReset']() {
    this.executionManager.softReset();
  }

  ['getSpeed']() {
    return this.executionManager.getSpeed();
  }

  ['setSpeed'](speed) {
    this.executionManager.setSpeed(speed);
  }

  ['getRegion']() {
    return this.executionManager.getRegion();
  }

  ['setRegion'](region) {
    this.executionManager.setRegion(region);
  }

  ['getFPS']() {
    return this.executionManager.getFPS();
  }

  //=========================================================
  // Cartridge API
  //=========================================================

  ['loadCartridge'](file) {
    return this.cartridgeManager.loadCartridge(file);
  }

  ['downloadCartridge'](url) {
    return this.cartridgeManager.downloadCartridge(url);
  }

  ['insertCartridge'](arrayBuffer) {
    return this.cartridgeManager.insertCartridge(arrayBuffer);
  }

  ['removeCartridge']() {
    return this.cartridgeManager.removeCartridge();
  }

  ['isCartridgeInserted']() {
    return this.cartridgeManager.isCartridgeInserted();
  }

  //=========================================================
  // Video API
  //=========================================================

  ['setVideoOutput'](canvas) {
    this.videoManager.setCanvas(canvas);
  }

  ['setVideoRenderer'](renderer) {
    this.videoManager.setRenderer(renderer);
  }

  ['getVideoRenderer']() {
    return this.videoManager.getRenderer();
  }

  ['isVideoRendererSupported'](renderer) {
    return this.videoManager.isRendererSupported(renderer);
  }

  ['setVideoPalette'](palette) {
    this.videoManager.setPalette(palette);
  }

  ['getVideoPalette']() {
    return this.videoManager.getPalette();
  }

  ['setVideoScale'](scale) {
    this.videoManager.setScale(scale);
  }

  ['getVideoScale'](scale) {
    return this.videoManager.getScale();
  }

  ['getMaxVideoScale']() {
    return this.videoManager.getMaxScale();
  }

  ['setVideoSmoothing'](smoothing) {
    this.videoManager.setSmoothing(smoothing);
  }

  ['isVideoSmoothing']() {
    return this.videoManager.isSmoothing();
  }

  ['setVideoDebugging'](debugging) {
    this.videoManager.setDebugging(debugging);
  }

  ['isVideoDebugging']() {
    return this.videoManager.isDebugging();
  }

  ['enterFullscreen']() {
    this.videoManager.enterFullscreen();
  }

  ['setFullscreenMode'](mode) {
    this.videoManager.setFullscreenMode(mode);
  }

  ['getFullscreenMode']() {
    return this.videoManager.getFullscreenMode();
  }

  //=========================================================
  // Audio API
  //=========================================================

  ['isAudioSupported']() {
    return this.audioManager.isSupported();
  }

  ['setAudioEnabled'](enabled) {
    this.audioManager.setEnabled(enabled);
  }

  ['isAudioEnabled']() {
    return this.audioManager.isEnabled();
  }

  ['setAudioVolume'](volume) {
    this.audioManager.setVolume(volume);
  }

  ['getAudioVolume']() {
    return this.audioManager.getVolume();
  }

  ['setAudioChannelEnabled'](channel, enabled) {
    this.audioManager.setChannelEnabled(channel, enabled);
  }

  ['isAudioChannelEnabled'](channel) {
    return this.audioManager.isChannelEnabled(channel);
  }

  //=========================================================
  // Input API
  //=========================================================

  ['setInputDevice'](port, id) {
    this.inputManager.connectTarget(port, id);
  }

  ['getInputDevice'](port) {
    return this.inputManager.getConnectedTarget(port);
  }

  ['mapInput'](targetPort, targetId, targetInput, sourceId, sourceInput) {
    this.inputManager.mapInput(targetPort, targetId, targetInput, sourceId, sourceInput);
  }

  ['unmapInput'](targetPort, targetId, targetInput, sourceId, sourceInput) {
    this.inputManager.unmapInput(targetPort, targetId, targetInput, sourceId, sourceInput);
  }

  ['getMappedInputName'](targetPort, targetId, targetInput) {
    return this.inputManager.getMappedInputName(targetPort, targetId, targetInput);
  }

  ['recordInput'](callback) {
    this.inputManager.recordInput(callback);
  }

  //=========================================================
  // Persistence API
  //=========================================================

  ['setStorage'](storage) {
    this.persistenceManager.setStorage(storage);
  }

  ['getStorage']() {
    this.persistenceManager.getStorage();
  }

  ['setSaveOnClose'](enabled) {
    this.persistenceManager.setSaveOnClose(enabled);
  }

  ['isSaveOnClose']() {
    return this.persistenceManager.isSaveOnClose();
  }

  ['setSavePeriod'](period) {
    this.persistenceManager.setSavePeriod(period);
  }

  ['getSavePeriod']() {
    return this.persistenceManager.getSavePeriod();
  }

  ['loadCartridgeData']() {
    return this.persistenceManager.loadCartridgeData();
  }

  ['saveCartridgeData']() {
    return this.persistenceManager.saveCartridgeData();
  }

  ['deleteAllCartridgeData']() {
    return this.persistenceManager.deleteAllCartridgeData();
  }

  ['loadConfiguration']() {
    return this.persistenceManager.loadConfiguration();
  }

  ['saveConfiguration']() {
    return this.persistenceManager.saveConfiguration();
  }

  ['resetConfiguration']() {
    return new Promise(resolve => {
      this.persistenceManager.deleteConfiguration().then(() => {
        this['setDefaults']();
        resolve();
      });
    });
  }

  ['readConfiguration']() {
    return this.persistenceManager.readConfiguration();
  }

  ['writeConfiguration'](config) {
    this.persistenceManager.writeConfiguration(config);
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
