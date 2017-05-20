import {log, Region, toString} from '../../../core/src/common';
import FpsCounter from './FpsCounter';

const regions = {
  'auto': null,
  'ntsc': Region.NTSC,
  'pal': Region.PAL,
};

export const fakeAudio = {
  setActive() {},
  setSpeed() {},
};

export default class System {

  constructor(nes, video, audio, sources) {
    log.info('Initializing system');

    this.nes = nes;
    this.video = video;
    this.audio = audio || fakeAudio;
    this.sources = sources;
    this.fps = new FpsCounter;

    this.setRegion('auto');
    this.setSpeed(1);

    document.addEventListener('visibilitychange', () => this.onVisibilityChange());
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

  // We are using setInterval over setTimout for 2 reasons:
  // - it ensures much more stable frame rate (especially when emulation speed > 1)
  // - its calls won't overlap because there is no async code

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
      this.execId = null;
      this.audio.setActive(false);
      this.sources.setActive(false);
    }
  }

  restart() {
    this.stop();
    this.start();
  }

  isRunning() {
    return this.execId != null;
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
      throw new Error('Invalid region: ' + toString(name));
    }
    if (this.regionName !== name) {
      log.info(`Setting region to "${name}"`);
      this.regionName = name;
      this.nes.setRegion(regions[name]);
      if (this.isRunning()) {
        this.restart(); // To refresh step period
      }
    }
  }

  getRegion() {
    return this.regionName;
  }

  //=========================================================
  // Speed
  //=========================================================

  setSpeed(speed) {
    if (typeof speed !== 'number' || speed <= 0) {
      throw new Error('Invalid speed: ' + toString(speed));
    }
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

  getFPS() {
    return this.fps.get();
  }

  getTargetFPS() {
    const region = this.nes.getUsedRegion();
    return Region.getParams(region).framesPerSecond;
  }

}
