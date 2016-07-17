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
    if (context) {
      this.gainNode = context.createGain();
      this.gainNode.connect(context.destination);
    }
  }

  setMasterVolume(volume) {
    if (this.getMasterVolume() !== volume) {
      log.info(`Setting master volume to ${formatVolume(volume)}`);
      this.volume = volume;
      if (this.gainNode) {
        this.gainNode.gain.value = this.volume;
      }
    }
  }

  getMasterVolume() {
    return this.volume;
  }

  setChannelVolume(name, volume) {
    if (this.getChannelVolume(name) !== volume) {
      log.info(`Setting volume of "${name}" channel to ${formatVolume(volume)}`);
      this.nes.setAudioChannelVolume(channels[name], volume);
    }
  }

  getChannelVolume(name) {
    return this.nes.getAudioChannelVolume(channels[name]);
  }

}

function formatVolume(volume) {
  return ~~(100 * volume) + '%';
}
