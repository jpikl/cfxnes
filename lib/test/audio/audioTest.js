/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* global expect */

import NES from '../../../core/src/NES';
import Audio from '../../src/audio/Audio';

describe('audio/Audio', () => {
  const channels = ['pulse1', 'pulse2', 'triangle', 'noise', 'dmc'];
  let nes, audio;

  beforeEach(() => {
    nes = new NES;
    audio = new Audio(nes);
  });

  afterEach(() => {
    return audio.close();
  });

  it('checks if it is supported', () => {
    expect(audio.isSupported()).to.be.equal(typeof AudioContext !== 'undefined');
  });

  it('is enabled by default', () => {
    expect(audio.isEnabled()).to.be.true;
  });

  it('sets/gets enablement', () => {
    audio.setEnabled(false);
    expect(audio.isEnabled()).to.be.false;
    audio.setEnabled(true);
    expect(audio.isEnabled()).to.be.true;
  });

  it('throws error when setting invalid enablement', () => {
    expect(() => audio.setEnabled()).to.throw('Invalid audio enabled');
    expect(() => audio.setEnabled('x')).to.throw('Invalid audio enabled');
  });

  it('is not active by default', () => {
    expect(audio.isActive()).to.be.false;
  });

  it('sets/gets activity', () => {
    audio.setActive(false);
    expect(audio.isActive()).to.be.false;
    audio.setActive(true);
    expect(audio.isActive()).to.be.true;
  });

  it('has undefined speed by default', () => {
    expect(audio.getSpeed()).to.be.undefined;
  });

  it('sets/gets speed', () => {
    audio.setSpeed(1);
    expect(audio.getSpeed()).to.be.equal(1);
    audio.setSpeed(0.5);
    expect(audio.getSpeed()).to.be.equal(0.5);
  });

  it('sets/gets master volume', () => {
    audio.setVolume(0.75);
    expect(audio.getVolume()).to.be.equal(0.75);
    expect(audio.getVolume('master')).to.be.equal(0.75);
    audio.setVolume('master', 0.25);
    expect(audio.getVolume()).to.be.equal(0.25);
    expect(audio.getVolume('master')).to.be.equal(0.25);
  });

  it('throws error when setting invalid master volume', () => {
    expect(() => audio.setVolume()).to.throw('Invalid audio volume');
    expect(() => audio.setVolume('x')).to.throw('Invalid audio volume');
    expect(() => audio.setVolume(-0.1)).to.throw('Invalid audio volume');
    expect(() => audio.setVolume(1.1)).to.throw('Invalid audio volume');
    expect(() => audio.setVolume('master')).to.throw('Invalid audio volume');
    expect(() => audio.setVolume('master', 'x')).to.throw('Invalid audio volume');
    expect(() => audio.setVolume('master', -0.1)).to.throw('Invalid audio volume');
    expect(() => audio.setVolume('master', 1.1)).to.throw('Invalid audio volume');
  });

  for (const channel of channels) {
    it(`sets/gets ${channel} channel volume`, () => {
      audio.setVolume(channel, 0.75);
      expect(audio.getVolume(channel)).to.be.equal(0.75);
    });
  }

  it('throws error when setting volume for invalid channel', () => {
    expect(() => audio.setVolume('x', 0.5)).to.throw('Invalid audio channel');
  });

  it('throws error when setting invalid volume for a channel', () => {
    expect(() => audio.setVolume('pulse1')).to.throw('Invalid audio volume');
    expect(() => audio.setVolume('pulse1', -0.1)).to.throw('Invalid audio volume');
    expect(() => audio.setVolume('pulse1', 1.1)).to.throw('Invalid audio volume');
  });

  it('throws error when getting volume for invalid channel', () => {
    expect(() => audio.getVolume('x')).to.throw('Invalid audio channel');
  });

  it('has valid default volume configuration', () => {
    expectVolumes(0.5, 1, 1, 1, 1, 1);
  });

  it('uses valid default volume for undefined values', () => {
    audio.setVolumes({});
    expectVolumes(0.5, 1, 1, 1, 1, 1);
  });

  it('sets volume configuration', () => {
    audio.setVolumes({master: 0.1, pulse1: 0.2, pulse2: 0.3, triangle: 0.4, noise: 0.5, dmc: 0.6});
    expectVolumes(0.1, 0.2, 0.3, 0.4, 0.5, 0.6);
  });

  it('sets volume configuration by specifying only master volume', () => {
    audio.setVolumes(0.1);
    expectVolumes(0.1, 1, 1, 1, 1, 1);
  });

  it('throws error when setting invalid volume configuration', () => {
    expect(() => audio.setVolumes()).to.throw('Invalid audio volume');
    expect(() => audio.setVolumes(null)).to.throw('Invalid audio volume');
    expect(() => audio.setVolumes('x')).to.throw('Invalid audio volume');
    expect(() => audio.setVolumes(-0.1)).to.throw('Invalid audio volume');
    expect(() => audio.setVolumes(1.1)).to.throw('Invalid audio volume');
  });

  it('gets volume configuration', () => {
    setVolumes(0.1, 0.2, 0.3, 0.4, 0.5, 0.6);
    expect(audio.getVolumes()).to.deep.equal({master: 0.1, pulse1: 0.2, pulse2: 0.3, triangle: 0.4, noise: 0.5, dmc: 0.6});
  });

  function setVolumes(master, pulse1, pulse2, triangle, noise, dmc) {
    audio.setVolume(master);
    audio.setVolume('pulse1', pulse1);
    audio.setVolume('pulse2', pulse2);
    audio.setVolume('triangle', triangle);
    audio.setVolume('noise', noise);
    audio.setVolume('dmc', dmc);
  }

  function expectVolumes(master, pulse1, pulse2, triangle, noise, dmc) {
    expect(audio.getVolume()).to.be.equal(master);
    expect(audio.getVolume('master')).to.be.equal(master);
    expect(audio.getVolume('pulse1')).to.be.equal(pulse1);
    expect(audio.getVolume('pulse2')).to.be.equal(pulse2);
    expect(audio.getVolume('triangle')).to.be.equal(triangle);
    expect(audio.getVolume('noise')).to.be.equal(noise);
    expect(audio.getVolume('dmc')).to.be.equal(dmc);
  }
});
