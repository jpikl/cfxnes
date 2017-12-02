import {NES} from '../../../core';
import Audio from '../../src/audio/Audio';
import {hasAudioContext, closeAudioContext} from '../../src/audio/context';

describe('audio/Audio', () => {
  const channels = ['master', 'pulse1', 'pulse2', 'triangle', 'noise', 'dmc'];
  let nes, audio;

  before(function() {
    if (!hasAudioContext()) {
      this.skip();
    }
  });

  beforeEach(() => {
    nes = new NES;
    audio = new Audio(nes);
  });

  after(closeAudioContext);

  it('is enabled by default', () => {
    expect(audio.isEnabled()).to.be.true;
  });

  it('changes enablement', () => {
    audio.setEnabled(false);
    expect(audio.isEnabled()).to.be.false;
    audio.setEnabled(true);
    expect(audio.isEnabled()).to.be.true;
  });

  it('throws error when setting invalid enablement', () => {
    expect(() => audio.setEnabled()).to.throw('Invalid audio enabled: undefined');
    expect(() => audio.setEnabled('x')).to.throw('Invalid audio enabled: "x"');
  });

  it('is not active by default', () => {
    expect(audio.isActive()).to.be.false;
  });

  it('changes activity', () => {
    audio.setActive(false);
    expect(audio.isActive()).to.be.false;
    audio.setActive(true);
    expect(audio.isActive()).to.be.true;
  });

  it('has speed equal to 1 by default', () => {
    expect(audio.getSpeed()).to.equal(1);
  });

  it('changes speed', () => {
    audio.setSpeed(1);
    expect(audio.getSpeed()).to.equal(1);
    audio.setSpeed(0.5);
    expect(audio.getSpeed()).to.equal(0.5);
  });

  for (const channel of channels) {
    const volume = channel === 'master' ? 0.5 : 1;
    it(`has ${volume} ${channel} volume by default`, () => {
      expect(audio.getVolume(channel)).to.equal(volume);
    });
  }

  for (const channel of channels) {
    it(`changes ${channel} volume`, () => {
      audio.setVolume(channel, 0.75);
      expect(audio.getVolume(channel)).to.equal(0.75);
    });
  }

  it('throws error when setting volume of invalid channel', () => {
    expect(() => audio.setVolume('x', 0.5)).to.throw('Invalid audio channel: "x"');
  });

  for (const channel of channels) {
    it(`throws error when setting invalid ${channel} volume`, () => {
      expect(() => audio.setVolume(channel)).to.throw('Invalid audio volume: undefined');
      expect(() => audio.setVolume(channel, -0.1)).to.throw('Invalid audio volume: -0.1');
      expect(() => audio.setVolume(channel, 1.1)).to.throw('Invalid audio volume: 1.1');
    });
  }

  it('throws error when getting volume of invalid channel', () => {
    expect(() => audio.getVolume('x')).to.throw('Invalid audio channel: "x"');
  });
});
