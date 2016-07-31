import log from '../../../core/src/common/log';
import Options from '../data/Options';
import Processor from './Processor';
import Mixer, {channels} from './Mixer';

export default class Audio {

  constructor(nes) {
    log.info('Initializing audio');
    this.initAudio(nes);
    this.initOptions();
  }

  initAudio(nes) {
    this.nes = nes;
    this.active = false;
    this.context = window.AudioContext ? new AudioContext : null;
    this.processor = new Processor(nes, this.context);
    this.mixer = new Mixer(nes, this.context);
  }

  initOptions() {
    this.options = new Options(this);
    this.options.add('audioEnabled', this.setEnabled, this.isEnabled, true);
    this.options.add('audioVolume', this.setVolumes, this.getVolumes, {});
    this.options.reset();
  }

  isSupported() {
    return this.context !== null;
  }

  close() {
    return this.context.close();
  }

  //=========================================================
  // State
  //=========================================================

  setEnabled(enabled) {
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
    if (this.isSupported()) {
      const enabled = this.enabled && this.active;
      this.nes.setAudioEnabled(enabled);
      this.processor.setMixer(enabled ? this.mixer : null);
    }
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

  setVolumes(volumes) {
    if (typeof volumes === 'number') {
      this.setVolume(volumes);
      return;
    }
    for (const channel in channels) {
      let volume = volumes[channel];
      if (volume == null) {
        volume = channel === 'master' ? 0.5 : 1.0;
      }
      this.setVolume(channel, volume);
    }
  }

  getVolumes() {
    const volumes = {};
    for (const channel in channels) {
      volumes[channel] = this.getVolume(channel);
    }
    return volumes;
  }

  setVolume(channel, volume) {
    if (typeof channel === 'number' && volume === undefined) {
      this.mixer.setMasterVolume(channel);
    } else if (channel === 'master') {
      this.mixer.setMasterVolume(volume);
    } else {
      this.mixer.setChannelVolume(channel, volume);
    }
  }

  getVolume(channel) {
    if (channel === undefined || channel === 'master') {
      return this.mixer.getMasterVolume();
    }
    return this.mixer.getChannelVolume(channel);
  }

}
