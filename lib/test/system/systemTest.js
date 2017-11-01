import {NES} from '../../../core';
import System from '../../src/system/System';
import {asyncIt} from '../utils';

const DELAY = 100;

describe('system/System', () => {
  let nes, system, video, audio, sources;

  beforeEach(() => {
    nes = new NES;
    video = {
      framesRendered: 0,
      framesDrawn: 0,
      output: null,
      renderFrame() { this.framesRendered++; },
      drawFrame() { this.framesDrawn++; },
      getOutput() { return this.output; },
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

  asyncIt('does not render/draw frames while running with no video output', DELAY, () => {
    system.start();
  }, () => {
    expect(video.framesRendered).to.equal(0);
    expect(video.framesDrawn).to.equal(0);
  });

  asyncIt('renders/draws frames while running with video output set', DELAY, () => {
    video.output = document.createElement('canvas');
    system.start();
  }, () => {
    expect(video.framesRendered).to.be.above(0);
    expect(video.framesDrawn).to.be.above(0);
  });

  asyncIt('renders/draws zero frames per step when no video output is set', DELAY, () => {
    system.step();
  }, () => {
    expect(video.framesRendered).to.equal(0);
    expect(video.framesDrawn).to.equal(0);
  });

  asyncIt('renders/draws one frame per step when video output is set', DELAY, () => {
    video.output = document.createElement('canvas');
    system.step();
  }, () => {
    expect(video.framesRendered).to.equal(1);
    expect(video.framesDrawn).to.equal(1);
  });

  it('does HW reset', () => {
    system.power();
  });

  it('does SW reset', () => {
    system.reset();
  });

  it('has automatic region detection by default', () => {
    expect(system.getRegion()).to.equal('auto');
  });

  for (const region of ['auto', 'ntsc', 'pal']) {
    it(`changes region to "${region}"`, () => {
      system.setRegion(region);
      expect(system.getRegion()).to.equal(region);
    });
  }

  it('throws error when setting invalid region', () => {
    expect(() => system.setRegion()).to.throw('Invalid region: undefined');
    expect(() => system.setRegion('x')).to.throw('Invalid region: "x"');
  });

  it('has 1x speed by default', () => {
    expect(system.getSpeed()).to.equal(1);
  });

  it('changes speed', () => {
    system.setSpeed(2);
    expect(system.getSpeed()).to.equal(2);
  });

  it('throws error when setting invalid speed', () => {
    expect(() => system.setSpeed()).to.throw('Invalid speed: undefined');
    expect(() => system.setSpeed('x')).to.throw('Invalid speed: "x"');
    expect(() => system.setSpeed(0)).to.throw('Invalid speed: 0');
    expect(() => system.setSpeed(-1)).to.throw('Invalid speed: -1');
  });

  it('changes audio speed', () => {
    system.setSpeed(2);
    expect(audio.speed).to.equal(2);
  });

  asyncIt('provides FPS counter', DELAY, () => {
    system.start();
  }, () => {
    expect(system.getFPS()).to.be.above(0);
  });
});
