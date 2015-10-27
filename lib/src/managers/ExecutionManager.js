// jscs:disable disallowQuotedKeysInObjects, requireDotNotation

import Region from '../../../core/src/common/Region';
import logger from '../../../core/src/utils/logger';
import { clearArray } from '../../../core/src/utils/arrays';

const regionAliases = {
  'ntsc': Region.NTSC,
  'pal': Region.PAL,
};

//=========================================================
// Execution manager
//=========================================================

export default class ExecutionManager {

  constructor() {
    this.dependencies = ['nes', 'videoManager', 'audioManager', 'inputManager'];
  }

  inject(nes, videoManager, audioManager, inputManager) {
    this.nes = nes;
    this.videoManager = videoManager;
    this.audioManager = audioManager;
    this.inputManager = inputManager;
    this.initFPS();
    this.initCallbacks();
    this.initListeners();
    this.setDefaults();
  }

  initCallbacks() {
    this.stepCallback = () => this.step();
    this.drawCallback = () => this.videoManager.drawFrame();
  }

  initListeners() {
    document.addEventListener('visibilitychange', () => this.onVisibilityChange());
  }

  setDefaults() {
    logger.info('Using default execution configuration');
    this.setRegion();
    this.setSpeed();
  }

  //=========================================================
  // Execution
  //=========================================================

  start() {
    if (!this.isRunning()) {
      logger.info('Starting execution');
      var period = 1000 / (this.speed * this.getTargetFPS());
      this.executionId = setInterval(this.stepCallback, period);
      this.audioManager.setPlaying(true);
    }
  }

  stop() {
    if (this.isRunning()) {
      logger.info('Stopping execution');
      clearInterval(this.executionId);
      this.executionId = null;
      this.audioManager.setPlaying(false);
    }
  }

  restart() {
    this.stop();
    this.start();
  }

  isRunning() {
    return this.executionId != null;
  }

  step() {
    this.inputManager.updateState();
    this.videoManager.renderFrame();
    this.updateFPS();
    cancelAnimationFrame(this.drawId); // In case we are running faster then browser refresh rate
    this.drawId = requestAnimationFrame(this.drawCallback);
  }

  //=========================================================
  // Visibility change
  //=========================================================

  onVisibilityChange() {
    if (document.hidden) {
      logger.info('Lost visibility');
      this.autoPaused = this.isRunning();
      this.stop();
    } else {
      logger.info('Gained visibility');
      if (this.autoPaused) {
        this.start();
      }
    }
  }

  //=========================================================
  // Inputs
  //=========================================================

  hardReset() {
    logger.info('Hard reset');
    this.nes.pressPower();
  }

  softReset() {
    logger.info('Soft reset');
    this.nes.pressReset();
  }

  //=========================================================
  // Region
  //=========================================================

  setRegion(region = null) {
    if (this.region !== region) {
      logger.info(`Setting region to "${region || 'autodetection mode'}"`);
      this.region = region;
      this.nes.setRegion(regionAliases[region]);
      if (this.isRunning()) {
        this.restart(); // To refresh step period
      }
    }
  }

  getRegion() {
    return this.region;
  }

  //=========================================================
  // Emulation speed
  //=========================================================

  setSpeed(speed = 1) {
    if (this.speed !== speed) {
      logger.info(`Setting emulation speed to ${speed}x`);
      this.speed = speed;
      this.audioManager.setSpeed(speed);
      if (this.isRunning()) {
        this.restart(); // To refresh step period
      }
    }
  }

  getSpeed() {
    return this.speed;
  }

  //=========================================================
  // FPS conting
  //=========================================================

  initFPS() {
    this.fpsTime = 0;
    this.fpsIndex = 0;
    this.fpsBuffer = new Array(10);
    clearArray(this.fpsBuffer);
  }

  updateFPS() {
    var timeNow = Date.now();
    this.fpsBuffer[this.fpsIndex] = 1000 / (timeNow - this.fpsTime);
    this.fpsIndex = (this.fpsIndex + 1) % this.fpsBuffer.length;
    this.fpsTime = timeNow;
  }

  getFPS() {
    var fpsSum = this.fpsBuffer.reduce((a, b) => a + b);
    return fpsSum / this.fpsBuffer.length;
  }

  getTargetFPS() {
    return Region.getParams(this.nes.getRegion()).framesPerSecond;
  }

  //=========================================================
  // Configuration
  //=========================================================

  readConfiguration(config) {
    config['region'] = this.getRegion();
    config['speed'] = this.getSpeed();
  }

  writeConfiguration(config) {
    if (config['region'] !== undefined) this.setRegion(config['region']);
    if (config['speed'] !== undefined) this.setSpeed(config['speed']);
  }

}
