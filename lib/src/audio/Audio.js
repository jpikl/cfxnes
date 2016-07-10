import log from '../../../core/src/common/log';
import APU from '../../../core/src/audio/APU';
import Options from '../data/Options';

const channelIds = {
  'pulse1': APU['PULSE_1'], // Must be specified using string key (closure compiler issue)
  'pulse2': APU['PULSE_2'],
  'triangle': APU['TRIANGLE'],
  'noise': APU['NOISE'],
  'dmc': APU['DMC'],
};

export default class Audio {

  constructor(nes) {
    log.info('Initializing audio');
    this.nes = nes;
    if (this.isSupported()) {
      this.initAudio();
    }
    this.initOptions();
  }

  isSupported() {
    return window.AudioContext !== null;
  }

  initAudio() {
    log.info('Creating audio context');
    this.context = new AudioContext;
    this.gainNode = this.context.createGain();
    this.gainNode.connect(this.context.destination);
    this.processorNode = this.context.createScriptProcessor(4096, 0, 1); // 4K buffer, 0 input channels, 1 output channel
    this.processorNode.onaudioprocess = event => this.updateOutput(event);
    this.nes.setAudioBufferSize(this.processorNode.bufferSize);
  }

  initOptions() {
    this.options = new Options(this);
    this.options.add('audioEnabled', this.setEnabled, this.isEnabled, true);
    this.options.add('audioVolume', this.setVolumeConfig, this.getVolumeConfig, {});
    this.options.reset();
  }

  updateOutput(event) {
    const outputBuffer = event.outputBuffer;
    const sourceBuffer = this.nes.readAudioBuffer();
    outputBuffer.getChannelData(0).set(sourceBuffer); // copyToChannel is not implemented in all browsers yet, so we use this
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

  setSpeed(speed) {
    if (this.speed !== speed) {
      log.info(`Setting audio speed to ${speed}x`);
      this.speed = speed;
      this.nes.setAudioSampleRate(this.context.sampleRate / speed);
    }
  }

  updateState() {
    if (this.isSupported()) {
      const enabled = this.enabled && this.active;
      this.nes.setAudioEnabled(enabled);
      if (enabled) {
        this.processorNode.connect(this.gainNode);
      } else {
        this.processorNode.disconnect();
      }
    }
  }

  //=========================================================
  // Volume
  //=========================================================

  setVolumeConfig(config) {
    if (typeof config === 'number') {
      config = {'master': config};
    }
    const masterVolume = config['master'];
    this.setVolume(masterVolume != null ? masterVolume : 0.5);
    for (const channel in channelIds) {
      const channelVolume = config[channel];
      this.setVolume(channel, channelVolume != null ? channelVolume : 1.0);
    }
  }

  getVolumeConfig() {
    const config = {'master': this.getVolume()};
    for (const channel in channelIds) {
      config[channel] = this.getVolume(channel);
    }
    return config;
  }

  setVolume(channel, volume) {
    if (typeof channel === 'number' && volume === undefined) {
      [channel, volume] = ['master', channel];
    }
    if (this.getVolume(channel) !== volume) {
      if (channel === 'master') {
        log.info(`Setting master volume to ${~~(100 * volume)}%`);
        this.volume = volume;
        if (this.isSupported()) {
          this.gainNode.gain.value = this.volume;
        }
      } else {
        log.info(`Setting volume of "${channel}" channel to ${~~(100 * volume)}%`);
        this.nes.setAudioChannelVolume(channelIds[channel], volume);
      }
    }
  }

  getVolume(channel) {
    if (channel == null || channel === 'master') {
      return this.volume;
    }
    return this.nes.getAudioChannelVolume(channelIds[channel]);
  }

}
