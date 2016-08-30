import {assert} from '../../../core/src/common/utils';
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
    assertVolume(volume);
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
    assertChannel(name);
    assertVolume(volume);
    if (this.getChannelVolume(name) !== volume) {
      log.info(`Setting volume of "${name}" channel to ${formatVolume(volume)}`);
      this.nes.setAudioChannelVolume(channels[name], volume);
    }
  }

  getChannelVolume(name) {
    assertChannel(name);
    return this.nes.getAudioChannelVolume(channels[name]);
  }

}

function formatVolume(volume) {
  return ~~(100 * volume) + '%';
}

function assertVolume(volume) {
  assert(typeof volume === 'number' && volume >= 0 && volume <= 1, 'Invalid audio volume');
}

function assertChannel(name) {
  assert(name in channels, 'Invalid audio channel');
}
