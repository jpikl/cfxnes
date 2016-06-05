import {makeArray} from '../../../core/src/utils/array';
import Region from '../../../core/src/common/Region';
import logger from '../../../core/src/utils/logger';

const regionIds = {
  'auto': null,
  'ntsc': Region.NTSC,
  'pal': Region.PAL,
};

//=========================================================
// System module
//=========================================================

export default class SystemModule {

  constructor() {
    this.dependencies = ['nes', 'videoModule', 'audioModule', 'inputModule'];
  }

  inject(nes, videoModule, audioModule, inputModule) {
    this.nes = nes;
    this.videoModule = videoModule;
    this.audioModule = audioModule;
    this.inputModule = inputModule;
    this.initFPS();
    this.initCallbacks();
    this.initListeners();
    this.initOptions();
  }

  initCallbacks() {
    this.stepCallback = () => this.step();
    this.drawCallback = () => this.videoModule.drawFrame();
  }

  initListeners() {
    document.addEventListener('visibilitychange', () => this.onVisibilityChange());
  }

  initOptions() {
    this.options = [
      {name: 'region', get: this.getRegion, set: this.setRegion, def: 'auto'},
      {name: 'speed', get: this.getSpeed, set: this.setSpeed, def: 1},
    ];
  }

  //=========================================================
  // Execution
  //=========================================================

  start() {
    if (!this.isRunning()) {
      logger.info('Starting execution');
      const period = 1000 / (this.speed * this.getTargetFPS());
      this.executionId = setInterval(this.stepCallback, period);
      this.audioModule.setPlaying(true);
    }
  }

  stop() {
    if (this.isRunning()) {
      logger.info('Stopping execution');
      clearInterval(this.executionId);
      this.executionId = null;
      this.audioModule.setPlaying(false);
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
    this.inputModule.updateState();
    this.videoModule.renderFrame();
    this.updateFPS();
    cancelAnimationFrame(this.drawId); // In case we are running faster than browser refresh rate
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
  // Reset
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

  setRegion(region) {
    if (region in regionIds && this.region !== region) {
      logger.info(`Setting region to "${region}"`);
      this.region = region;
      this.nes.setRegion(regionIds[region]);
      if (this.isRunning()) {
        this.restart(); // To refresh step period
      }
    }
  }

  getRegion() {
    return this.region;
  }

  //=========================================================
  // Speed
  //=========================================================

  setSpeed(speed) {
    if (this.speed !== speed) {
      logger.info(`Setting emulation speed to ${speed}x`);
      this.speed = speed;
      this.audioModule.setSpeed(speed);
      if (this.isRunning()) {
        this.restart(); // To refresh step period
      }
    }
  }

  getSpeed() {
    return this.speed;
  }

  //=========================================================
  // FPS
  //=========================================================

  initFPS() {
    this.fpsTime = 0;
    this.fpsIndex = 0;
    this.fpsBuffer = makeArray(10);
  }

  updateFPS() {
    const timeNow = Date.now();
    this.fpsBuffer[this.fpsIndex] = 1000 / (timeNow - this.fpsTime);
    this.fpsIndex = (this.fpsIndex + 1) % this.fpsBuffer.length;
    this.fpsTime = timeNow;
  }

  getFPS() {
    const fpsSum = this.fpsBuffer.reduce((a, b) => a + b);
    return fpsSum / this.fpsBuffer.length;
  }

  getTargetFPS() {
    return Region.getParams(this.nes.getRegion()).framesPerSecond;
  }

}
