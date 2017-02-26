import {toString} from '../../../core/src/common/utils';
import log from '../../../core/src/common/log';
import APU from '../../../core/src/audio/APU';

export const channels = {
  'master': null,
  'pulse1': APU['PULSE_1'], // Must be specified using string key (closure compiler issue)
  'pulse2': APU['PULSE_2'],
  'triangle': APU['TRIANGLE'],
  'noise': APU['NOISE'],
  'dmc': APU['DMC'],
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
      this.nes.setAudioChannelVolume(channels[name], volume);
    }
  }

  getChannelVolume(name) {
    if (!isChannel(name)) {
      throw new Error('Invalid audio channel: ' + toString(name));
    }
    return this.nes.getAudioChannelVolume(channels[name]);
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
