import {toString} from '../../../core/src/common/utils';
import log from '../../../core/src/common/log';
import Processor from './Processor';
import Mixer from './Mixer';
import {getAudioContext} from './context';

export default class Audio {

  constructor(nes) {
    log.info('Initializing audio');

    this.nes = nes;
    this.active = false;
    this.context = getAudioContext();
    this.processor = new Processor(nes, this.context);
    this.mixer = new Mixer(nes, this.context);

    this.setEnabled(true);
  }

  //=========================================================
  // State
  //=========================================================

  setEnabled(enabled) {
    if (typeof enabled !== 'boolean') {
      throw new Error('Invalid audio enabled: ' + toString(enabled));
    }
    if (this.enabled !== enabled) {
      log.info(`Audio ${enabled ? 'enabled' : 'disabled'}`);
      this.enabled = enabled;
      this.updateState();
    }
  }

  isEnabled() {
    return this.enabled;
  }

  setActive(active) {
    if (this.active !== active) {
      log.info(`Audio ${active ? 'resumed' : 'suspended'}`);
      this.active = active;
      this.updateState();
    }
  }

  isActive() {
    return this.active;
  }

  updateState() {
    const enabled = this.enabled && this.active;
    this.nes.setAudioEnabled(enabled);
    this.processor.setMixer(enabled ? this.mixer : null);
  }

  //=========================================================
  // Speed
  //=========================================================

  setSpeed(speed) {
    if (this.speed !== speed) {
      log.info(`Setting audio speed to ${speed}x`);
      this.speed = speed;
      this.nes.setAudioSampleRate(this.context.sampleRate / speed);
    }
  }

  getSpeed() {
    return this.speed;
  }

  //=========================================================
  // Volume
  //=========================================================

  setVolume(channel, volume) {
    if (channel === 'master') {
      this.mixer.setMasterVolume(volume);
    } else {
      this.mixer.setChannelVolume(channel, volume);
    }
  }

  getVolume(channel) {
    if (channel === 'master') {
      return this.mixer.getMasterVolume();
    }
    return this.mixer.getChannelVolume(channel);
  }

}

