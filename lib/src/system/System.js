import {log, Region, describe} from '../../../core';
import FpsCounter from './FpsCounter';

const AUTO = 'auto';

const regions = {
  [AUTO]: null,
  'ntsc': Region.NTSC,
  'pal': Region.PAL,
};

const fakeAudio = {
  setActive() {},
  setSpeed() {},
};

export default class System {

  constructor(nes, video, audio, sources) {
    log.info('Initializing system');

    this.nes = nes;
    this.video = video; // Video module
    this.audio = audio || fakeAudio; // Audio module
    this.autoPaused = false; // Whether running system was automatically paused
    this.regionName = AUTO; // Current region value
    this.speed = 1; // Emulation speed multiplier
    this.execId = 0; // ID of registered frame computation callback
    this.drawId = 0; // ID of registered frame display callback
    this.sources = sources; // List of sources
    this.fps = new FpsCounter;

    this.applyRegion();
    this.applySpeed();

    if (location.protocol === 'https:') { // Visibility change event might be blocked for unsecure connections by some browsers
      document.addEventListener('visibilitychange', () => this.onVisibilityChange());
    }
  }

  //=========================================================
  // Events
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
  // Execution
  //=========================================================

  // We are using setInterval over setTimeout for 2 reasons:
  // - It ensures much more stable frame rate (especially when emulation speed > 1).
  // - Its calls won't overlap because there is no async code.

  start() {
    if (!this.isRunning()) {
      log.info('Starting execution');
      const period = 1000 / (this.speed * this.getTargetFPS());
      this.execId = setInterval(() => this.step(), period);
      this.audio.setActive(true);
      this.sources.setActive(true);
    }
  }

  stop() {
    if (this.isRunning()) {
      log.info('Stopping execution');

      clearInterval(this.execId);
      cancelAnimationFrame(this.drawId);

      this.execId = 0;
      this.audio.setActive(false);
      this.sources.setActive(false);
    }
  }

  restart() {
    this.stop();
    this.start();
  }

  isRunning() {
    return Boolean(this.execId);
  }

  step() {
    if (this.video.getOutput()) {
      this.video.renderFrame();
      cancelAnimationFrame(this.drawId); // In case we are running faster than browser refresh rate
      this.drawId = requestAnimationFrame(() => this.video.drawFrame());
    }
    this.fps.update();
  }

  //=========================================================
  // Reset
  //=========================================================

  power() {
    log.info('HW reset');
    this.nes.power();
  }

  reset() {
    log.info('SW reset');
    this.nes.reset();
  }

  //=========================================================
  // Region
  //=========================================================

  setRegion(name) {
    if (!(name in regions)) {
      throw new Error('Invalid region: ' + describe(name));
    }

    if (this.regionName !== name) {
      log.info(`Setting region to "${name}"`);

      this.regionName = name;
      this.applyRegion();

      if (this.isRunning()) {
        this.restart(); // To refresh step period
      }
    }
  }

  applyRegion() {
    this.nes.setRegion(regions[this.regionName]);
  }

  getRegion() {
    return this.regionName;
  }

  //=========================================================
  // Speed
  //=========================================================

  setSpeed(speed) {
    if (typeof speed !== 'number' || speed <= 0) {
      throw new Error('Invalid speed: ' + describe(speed));
    }

    if (this.speed !== speed) {
      log.info(`Setting emulation speed to ${speed}x`);

      this.speed = speed;
      this.applySpeed();

      if (this.isRunning()) {
        this.restart(); // To refresh step period
      }
    }
  }

  applySpeed() {
    this.audio.setSpeed(this.speed);
  }

  getSpeed() {
    return this.speed;
  }

  //=========================================================
  // FPS
  //=========================================================

  getFPS() {
    return this.fps.get();
  }

  getTargetFPS() {
    const region = this.nes.getUsedRegion();
    return Region.getParams(region).framesPerSecond;
  }

}
