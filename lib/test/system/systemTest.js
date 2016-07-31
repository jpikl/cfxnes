/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import NES from '../../../core/src/NES';
import System from '../../src/system/System';
import {asyncIt} from '../utils';

describe('system/System', () => {
  let nes, system, video, audio, sources;

  beforeEach(() => {
    nes = new NES;
    video = {
      framesRendered: 0,
      framesDrawn: 0,
      renderFrame: function() { this.framesRendered++; },
      drawFrame: function() { this.framesDrawn++; },
    };
    audio = {
      active: false,
      speed: 1,
      setActive(active) { this.active = active; },
      setSpeed(speed) { this.speed = speed; },
    };
    sources = {
      active: false,
      setActive(active) { this.active = active; },
    };
    system = new System(nes, video, audio, sources);
  });

  afterEach(() => {
    system.stop();
  });

  it('is not running by default', () => {
    expect(system.isRunning()).to.be.false;
  });

  it('is running when started', () => {
    system.start();
    expect(system.isRunning()).to.be.true;
  });

  it('is not running when stopped', () => {
    system.stop();
    expect(system.isRunning()).to.be.false;
  });

  it('is not running when started and stopped', () => {
    system.start();
    system.stop();
    expect(system.isRunning()).to.be.false;
  });

  it('is running when restarted', () => {
    system.restart();
    expect(system.isRunning()).to.be.true;
  });

  it('is running when started and restarted', () => {
    system.start();
    system.restart();
    expect(system.isRunning()).to.be.true;
  });

  it('activates audio and sources when started', () => {
    system.start();
    expect(audio.active).to.be.true;
    expect(sources.active).to.be.true;
  });

  it('deactivates audio and sources when stopped', () => {
    system.start();
    system.stop();
    expect(audio.active).to.be.false;
    expect(sources.active).to.be.false;
  });

  asyncIt('renders and draw frames while running', 50, () => {
    system.start();
  }, () => {
    expect(video.framesRendered).to.be.above(0);
    expect(video.framesDrawn).to.be.above(0);
  });

  asyncIt('renders and draws one frame per step', 50, () => {
    system.step();
  }, () => {
    expect(video.framesRendered).to.be.equal(1);
    expect(video.framesDrawn).to.be.equal(1);
  });

  it('does hard reset', () => {
    system.hardReset();
  });

  it('does soft reset', () => {
    system.softReset();
  });

  it('has automatic region detection by default', () => {
    expect(system.getRegion()).to.be.equal('auto');
  });

  for (const region of ['auto', 'ntsc', 'pal']) {
    it('sets/gets ' + (region === 'auto' ? 'region autodetection' : `"${region}" region`), () => {
      system.setRegion(region);
      expect(system.getRegion()).to.be.equal(region);
    });
  }

  it('has 1x speed by default', () => {
    expect(system.getSpeed()).to.be.equal(1);
  });

  it('sets/gets speed', () => {
    system.setSpeed(2);
    expect(system.getSpeed()).to.be.equal(2);
  });

  it('changes audio speed', () => {
    system.setSpeed(2);
    expect(audio.speed).to.be.equal(2);
  });

  asyncIt('provides FPS counter', 50, () => {
    system.start();
  }, () => {
    expect(system.getFPS()).to.be.above(0);
  });
});
