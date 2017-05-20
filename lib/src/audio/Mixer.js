import {log, toString} from '../../../core/src/common';
import {Channel} from '../../../core/src/audio';

export const channels = {
  'master': null,
  'pulse1': Channel.PULSE_1,
  'pulse2': Channel.PULSE_2,
  'triangle': Channel.TRIANGLE,
  'noise': Channel.NOISE,
  'dmc': Channel.DMC,
};

export default class Mixer {

  constructor(nes, context) {
    log.info('Initializing audio mixer');
    this.nes = nes;
    this.gainNode = context.createGain();
    this.gainNode.connect(context.destination);
    this.setMasterVolume(0.5);
  }

  setMasterVolume(volume) {
    if (!isVolume(volume)) {
      throw new Error('Invalid audio volume: ' + toString(volume));
    }
    if (this.volume !== volume) {
      log.info(`Setting master volume to ${formatVolume(volume)}`);
      this.volume = volume; // We need a separate property, because gain.value does not exactly match the set value
      this.gainNode.gain.value = volume;
    }
  }

  getMasterVolume() {
    return this.volume;
  }

  setChannelVolume(name, volume) {
    if (!isChannel(name)) {
      throw new Error('Invalid audio channel: ' + toString(name));
    }
    if (!isVolume(volume)) {
      throw new Error('Invalid audio volume: ' + toString(volume));
    }
    if (this.getChannelVolume(name) !== volume) {
      log.info(`Setting volume of "${name}" channel to ${formatVolume(volume)}`);
      this.nes.setAudioVolume(channels[name], volume);
    }
  }

  getChannelVolume(name) {
    if (!isChannel(name)) {
      throw new Error('Invalid audio channel: ' + toString(name));
    }
    return this.nes.getAudioVolume(channels[name]);
  }

}

function formatVolume(volume) {
  return ~~(100 * volume) + '%';
}

function isVolume(volume) {
  return typeof volume === 'number' && volume >= 0 && volume <= 1;
}

function isChannel(name) {
  return name in channels;
}
