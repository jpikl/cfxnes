import log from '../../../core/src/common/log';
import Region from '../../../core/src/common/Region';
import Options from '../data/Options';

const regionIds = {
  'auto': null,
  'ntsc': Region.NTSC,
  'pal': Region.PAL,
};

export default class System {

  constructor(nes, video, audio, sources) {
    log.info('Initializing system');
    this.nes = nes;
    this.video = video;
    this.audio = audio;
    this.sources = sources;
    this.initFPS();
    this.initCallbacks();
    this.initListeners();
    this.initOptions();
  }

  initCallbacks() {
    this.stepCallback = () => this.step();
    this.drawCallback = () => this.video.drawFrame();
  }

  initListeners() {
    document.addEventListener('visibilitychange', () => this.onVisibilityChange());
  }

  initOptions() {
    this.options = new Options(this);
    this.options.add('region', this.setRegion, this.getRegion, 'auto');
    this.options.add('speed', this.setSpeed, this.getSpeed, 1);
    this.options.reset();
  }

  //=========================================================
  // Execution
  //=========================================================

  start() {
    if (!this.isRunning()) {
      log.info('Starting execution');
      const period = 1000 / (this.speed * this.getTargetFPS());
      this.executionId = setInterval(this.stepCallback, period);
      this.audio.setActive(true);
      this.sources.setActive(true);
    }
  }

  stop() {
    if (this.isRunning()) {
      log.info('Stopping execution');
      clearInterval(this.executionId);
      this.executionId = null;
      this.audio.setActive(false);
      this.sources.setActive(false);
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
    this.video.renderFrame();
    this.updateFPS();
    cancelAnimationFrame(this.drawId); // In case we are running faster than browser refresh rate
    this.drawId = requestAnimationFrame(this.drawCallback);
  }

  //=========================================================
  // Visibility change
  //=========================================================

  onVisibilityChange() {
    if (document.hidden) {
      log.info('Lost visibility');
      this.autoPaused = this.isRunning();
      this.stop();
    } else {
      log.info('Gained visibility');
      if (this.autoPaused) {
        this.start();
      }
    }
  }

  //=========================================================
  // Reset
  //=========================================================

  hardReset() {
    log.info('Hard reset');
    this.nes.hardReset();
  }

  softReset() {
    log.info('Soft reset');
    this.nes.softReset();
  }

  //=========================================================
  // Region
  //=========================================================

  setRegion(region) {
    if (region in regionIds && this.region !== region) {
      log.info(`Setting region to "${region}"`);
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
      log.info(`Setting emulation speed to ${speed}x`);
      this.speed = speed;
      this.audio.setSpeed(speed);
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
    this.fpsBuffer = new Array(10).fill(0);
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
