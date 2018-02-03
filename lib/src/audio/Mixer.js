import {log, describe} from '../../../core';

export const channels = {
  'master': -1,
  'pulse1': 0,
  'pulse2': 1,
  'triangle': 2,
  'noise': 3,
  'dmc': 4,
};

export default class Mixer {

  constructor(nes, context) {
    log.info('Initializing audio mixer');

    this.nes = nes;
    this.volume = 0.5; // We need to store volume as property because gain.value does not exactly match its set value
    this.gainNode = context.createGain();
    this.gainNode.connect(context.destination);

    this.applyVolume();
  }

  getInput() {
    return this.gainNode;
  }

  setVolume(name, volume) {
    if (typeof volume !== 'number' || volume < 0 || volume > 1) {
      throw new Error('Invalid audio volume: ' + describe(volume));
    }
    if (this.getVolume(name) !== volume) {
      log.info(`Setting volume of "${name}" channel to ${~~(100 * volume)}%`);
      const channel = channels[name];
      if (channel >= 0) {
        this.nes.setAudioVolume(channel, volume);
      } else {
        this.volume = volume;
        this.applyVolume();
      }
    }
  }

  applyVolume() {
    this.gainNode.gain.value = this.volume;
  }

  getVolume(name) {
    const channel = channels[name];
    if (channel == null) {
      throw new Error('Invalid audio channel: ' + describe(name));
    }
    if (channel >= 0) {
      return this.nes.getAudioVolume(channel);
    }
    return this.volume;
  }

}
