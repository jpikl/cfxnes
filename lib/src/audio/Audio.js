import {log, describe} from '../../../core';
import {getAudioContext} from './context';
import Processor from './Processor';
import Mixer from './Mixer';

export default class Audio {

  constructor(nes) {
    log.info('Initializing audio');

    this.enabled = true; // Whether audio is enabled
    this.active = false; // Whether audio is currently playing
    this.speed = 1; // Audio playback speed multiplier
    this.context = getAudioContext();
    this.processor = new Processor(nes, this.context);
    this.mixer = new Mixer(nes, this.context);

    this.applyEnabledAndActive();
    this.applySpeed();
  }

  //=========================================================
  // State
  //=========================================================

  setEnabled(enabled) {
    if (typeof enabled !== 'boolean') {
      throw new Error('Invalid audio enabled: ' + describe(enabled));
    }
    if (this.enabled !== enabled) {
      log.info(`Audio ${enabled ? 'enabled' : 'disabled'}`);
      this.enabled = enabled;
      this.applyEnabledAndActive();
    }
  }

  isEnabled() {
    return this.enabled;
  }

  setActive(active) {
    if (this.active !== active) {
      log.info(`Audio ${active ? 'resumed' : 'suspended'}`);
      this.active = active;
      this.applyEnabledAndActive();
    }
  }

  isActive() {
    return this.active;
  }

  applyEnabledAndActive() {
    if (this.enabled && this.active) {
      this.processor.connect(this.mixer.getInput());
      this.context.resume(); // Because of Chrome Autoplay policy
    } else {
      this.processor.disconnect();
    }
  }

  //=========================================================
  // Speed
  //=========================================================

  setSpeed(speed) {
    if (this.speed !== speed) {
      log.info(`Setting audio speed to ${speed}x`);
      this.speed = speed;
      this.applySpeed();
    }
  }

  applySpeed() {
    this.processor.setSampleRate(this.context.sampleRate / this.speed);
  }

  getSpeed() {
    return this.speed;
  }

  //=========================================================
  // Volume
  //=========================================================

  setVolume(channel, volume) {
    this.mixer.setVolume(channel, volume);
  }

  getVolume(channel) {
    return this.mixer.getVolume(channel);
  }

}
