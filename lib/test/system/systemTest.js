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

  it('should not be running by default', () => {
    expect(system.isRunning()).to.be.false;
  });

  it('should start when stopped', () => {
    system.start();
    expect(system.isRunning()).to.be.true;
  });

  it('should stop when started', () => {
    system.start();
    system.stop();
    expect(system.isRunning()).to.be.false;
  });

  it('should restart when stopped', () => {
    system.restart();
    expect(system.isRunning()).to.be.true;
  });

  it('should restart when started', () => {
    system.start();
    system.restart();
    expect(system.isRunning()).to.be.true;
  });

  it('should activate audio and sources when started', () => {
    system.start();
    expect(audio.active).to.be.true;
    expect(sources.active).to.be.true;
  });

  it('should deactivate audio and sources when stopped', () => {
    system.start();
    system.stop();
    expect(audio.active).to.be.false;
    expect(sources.active).to.be.false;
  });

  asyncIt('should render and draw frames while running', 50, () => {
    system.start();
  }, () => {
    expect(video.framesRendered).to.be.above(0);
    expect(video.framesDrawn).to.be.above(0);
  });

  asyncIt('should render/draw one frame per step', 50, () => {
    system.step();
  }, () => {
    expect(video.framesRendered).to.be.equal(1);
    expect(video.framesDrawn).to.be.equal(1);
  });

  it('should allow to do hard reset', () => {
    system.hardReset();
  });

  it('should allow to do soft reset', () => {
    system.softReset();
  });

  it('should have automatic region detection by default', () => {
    expect(system.getRegion()).to.be.equal('auto');
  });

  for (const region of ['auto', 'ntsc', 'pal']) {
    it(`should set/get "${region}" region`, () => {
      system.setRegion(region);
      expect(system.getRegion()).to.be.equal(region);
    });
  }

  it('should have 1x speed by default', () => {
    expect(system.getSpeed()).to.be.equal(1);
  });

  it('should set/get speed', () => {
    system.setSpeed(2);
    expect(system.getSpeed()).to.be.equal(2);
  });

  it('should change speed of audio', () => {
    system.setSpeed(2);
    expect(audio.speed).to.be.equal(2);
  });

  asyncIt('should provide FPS counter', 50, () => {
    system.start();
  }, () => {
    expect(system.getFPS()).to.be.above(0);
  });
});
