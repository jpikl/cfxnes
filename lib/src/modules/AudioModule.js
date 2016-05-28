import {copyArray} from '../../../core/src/utils/array';
import logger from '../../../core/src/utils/logger';

const channelIds = {
  'pulse1': 0,
  'pulse2': 1,
  'triangle': 2,
  'noise': 3,
  'dmc': 4,
};

//=========================================================
// Audio module
//=========================================================

export default class AudioModule {

  constructor() {
    this.dependencies = ['nes'];
  }

  inject(nes) {
    logger.info('Initializing audio module');
    this.nes = nes;
    if (this.isSupported()) {
      this.initAudio();
    }
    this.initOptions();
  }

  initOptions() {
    this.options = [
      {name: 'audioEnabled', get: this.isEnabled, set: this.setEnabled, def: true},
      {name: 'audioVolume', get: this.getVolume, set: this.setVolume, def: {}},
    ];
  }

  //=========================================================
  // Context
  //=========================================================

  isSupported() {
    return typeof AudioContext !== 'undefined' && AudioContext !== null;
  }

  initAudio() {
    logger.info('Creating audio context');
    this.context = new AudioContext;
    this.gain = this.context.createGain();
    this.gain.connect(this.context.destination);
    this.processor = this.context.createScriptProcessor(4096, 0, 1); // 4K buffer, 0 input channels, 1 output channel
    this.processor.onaudioprocess = event => this.updateAudio(event);
    this.nes.initAudioRecording(this.processor.bufferSize, this.context.sampleRate);
  }

  updateAudio(event) {
    const outputBuffer = event.outputBuffer;
    const sourceBuffer = this.nes.readAudioBuffer();
    if (outputBuffer.copyToChannel) {
      outputBuffer.copyToChannel(sourceBuffer, 0); // copyToChannel missing in Chrome (issue: 361859)
    } else {
      copyArray(sourceBuffer, outputBuffer.getChannelData(0));
    }
  }

  //=========================================================
  // State
  //=========================================================

  setEnabled(enabled) {
    if (this.enabled !== enabled) {
      logger.info(`Audio ${enabled ? 'on' : 'off'}`);
      this.enabled = enabled;
      this.updateState();
    }
  }

  isEnabled() {
    return this.enabled;
  }

  setPlaying(playing) {
    if (this.playing !== playing) {
      logger.info(`Audio ${playing ? 'resumed' : 'paused'}`);
      this.playing = playing;
      this.updateState();
    }
  }

  setSpeed(speed) {
    if (this.speed !== speed) {
      logger.info(`Setting audio speed to ${speed}x`);
      this.speed = speed;
      this.updateState();
    }
  }

  updateState() {
    if (this.isSupported()) {
      const shouldBeRecording = this.enabled && this.playing;
      if (shouldBeRecording !== this.nes.isAudioRecording()) {
        if (shouldBeRecording) {
          this.nes.startAudioRecording(this.context.sampleRate / this.speed);
          this.processor.connect(this.gain);
        } else {
          this.nes.stopAudioRecording();
          this.processor.disconnect();
        }
      }
    }
  }

  //=========================================================
  // Volume
  //=========================================================

  setVolume(config) {
    if (typeof config === 'number') {
      config = {'master': config};
    }
    const masterVolume = config['master'];
    this.setMasterVolume(masterVolume != null ? masterVolume : 0.5);
    for (const channel in channelIds) {
      const channelVolume = config[channel];
      this.setChannelVolume(channel, channelVolume != null ? channelVolume : 1.0);
    }
  }

  getVolume() {
    const config = {'master': this.getMasterVolume()};
    for (const channel in channelIds) {
      config[channel] = this.getChannelVolume(channel);
    }
    return config;
  }

  setMasterVolume(volume) {
    if (this.volume !== volume) {
      logger.info(`Setting master volume to ${~~(100 * volume)}%`);
      this.volume = volume;
      if (this.isSupported()) {
        this.gain.gain.value = this.volume;
      }
    }
  }

  getMasterVolume() {
    return this.volume;
  }

  setChannelVolume(channel, volume) {
    if (this.getChannelVolume(channel) !== volume) {
      logger.info(`Setting volume of "${channel}" channel to ${~~(100 * volume)}%`);
      this.nes.setAudioChannelVolume(channelIds[channel], volume);
    }
  }

  getChannelVolume(channel) {
    return this.nes.getAudioChannelVolume(channelIds[channel]);
  }

}
