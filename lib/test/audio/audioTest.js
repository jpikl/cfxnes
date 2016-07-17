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

  it('should return if it is supported', () => {
    expect(audio.isSupported()).to.be.equal(typeof AudioContext !== 'undefined');
  });

  it('should be enabled by default', () => {
    expect(audio.isEnabled()).to.be.true;
  });

  it('should set/get enablement', () => {
    audio.setEnabled(false);
    expect(audio.isEnabled()).to.be.false;
    audio.setEnabled(true);
    expect(audio.isEnabled()).to.be.true;
  });

  it('should set/get active', () => {
    audio.setActive(false);
    expect(audio.isActive()).to.be.false;
    audio.setActive(true);
    expect(audio.isActive()).to.be.true;
  });

  it('should set/get speed', () => {
    audio.setSpeed(1);
    expect(audio.getSpeed()).to.be.equal(1);
    audio.setSpeed(0.5);
    expect(audio.getSpeed()).to.be.equal(0.5);
  });

  it('should set/get master volume', () => {
    audio.setVolume(0.75);
    expect(audio.getVolume()).to.be.equal(0.75);
    expect(audio.getVolume('master')).to.be.equal(0.75);
    audio.setVolume('master', 0.25);
    expect(audio.getVolume()).to.be.equal(0.25);
    expect(audio.getVolume('master')).to.be.equal(0.25);
  });

  for (const channel of channels) {
    it(`should set/get ${channel} channel volume`, () => {
      audio.setVolume(channel, 0.75);
      expect(audio.getVolume(channel)).to.be.equal(0.75);
    });
  }

  it('should have default volume configuration', () => {
    expectVolumes(0.5, 1, 1, 1, 1, 1);
  });

  it('should set volume configuration', () => {
    audio.setVolumes({master: 0.1, pulse1: 0.2, pulse2: 0.3, triangle: 0.4, noise: 0.5, dmc: 0.6});
    expectVolumes(0.1, 0.2, 0.3, 0.4, 0.5, 0.6);
  });

  it('should use default volume configuration for missing values', () => {
    audio.setVolumes({});
    expectVolumes(0.5, 1, 1, 1, 1, 1);
  });

  it('should get volume configuration', () => {
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
    expect(audio.getVolume('pulse1')).to.be.equal(pulse1);
    expect(audio.getVolume('pulse2')).to.be.equal(pulse2);
    expect(audio.getVolume('triangle')).to.be.equal(triangle);
    expect(audio.getVolume('noise')).to.be.equal(noise);
    expect(audio.getVolume('dmc')).to.be.equal(dmc);
  }
});
