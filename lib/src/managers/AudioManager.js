// jscs:disable disallowQuotedKeysInObjects, requireDotNotation

import logger from '../../../core/src/utils/logger';
import { forEachProperty } from '../../../core/src/utils/objects';
import { arrayToProperties, copyArray } from '../../../core/src/utils/arrays';

const channelAliases = {
  'pulse1': 0,
  'pulse2': 1,
  'triangle': 2,
  'noise':  3,
  'dmc': 4,
};

export const channels = Object.keys(channelAliases);

//=========================================================
// Audio manager
//=========================================================

export default class AudioManager {

  constructor() {
    this.dependencies = ['nes'];
  }

  inject(nes) {
    logger.info('Initializing audio manager');
    this.nes = nes;
    if (this.isSupported()) {
      this.createAudio();
    }
    this.setDefaults();
  }

  setDefaults() {
    logger.info('Using default audio configuration');
    this.setEnabled();
    this.setVolume();
    for (var channel of channels) {
      this.setChannelEnabled(channel);
    }
  }

  //=========================================================
  // Audio context
  //=========================================================

  isSupported() {
    return typeof AudioContext !== 'undefined' && AudioContext !== null;
  }

  createAudio() {
    logger.info('Creating audio context');
    this.context = new AudioContext;
    this.gain = this.context.createGain();
    this.gain.connect(this.context.destination);
    this.processor = this.context.createScriptProcessor(4096, 0, 1); // 4K buffer, 0 input channels, 1 output channel
    this.processor.onaudioprocess = event => this.updateAudio(event);
    this.nes.initAudioRecording(this.processor.bufferSize, this.context.sampleRate);
  }

  updateAudio(event) {
    var outputBuffer = event.outputBuffer;
    var sourceBuffer = this.nes.readAudioBuffer();
    if (outputBuffer.copyToChannel) {
      outputBuffer.copyToChannel(sourceBuffer, 0); // Missing in chrome (issue: 361859)
    } else {
      copyArray(sourceBuffer, outputBuffer.getChannelData(0));
    }
  }

  //=========================================================
  // Audio state
  //=========================================================

  setEnabled(enabled = true) {
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
      logger.info(`Setting audio recording speed to ${speed}x`);
      this.speed = speed;
      this.updateState();
    }
  }

  updateState() {
    if (this.isSupported()) {
      var shouldBeRecording = this.enabled && this.playing;
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
  // Audio channels
  //=========================================================

  setChannelEnabled(channel, enabled = true) {
    var channelId = channelAliases[channel];
    if (channelId != null && this.isChannelEnabled(channel) !== enabled) {
      logger.info(`Audio channel "${channel}" ${enabled ? 'on' : 'off'}`);
      this.nes.setChannelEnabled(channelId, enabled);
    }
  }

  isChannelEnabled(channel) {
    return this.nes.isChannelEnabled(channelAliases[channel]);
  }

  //=========================================================
  // Audio volume
  //=========================================================

  setVolume(volume = 0.5) {
    volume = Math.max(0.0, Math.min(volume, 1.0));
    if (this.volume != volume) {
      logger.info(`Setting audio volume to ${~~(100 * volume)}%`);
      this.volume = volume;
      if (this.isSupported()) {
        this.gain.gain.value = this.volume;
      }
    }
  }

  getVolume() {
    return this.volume;
  }

  //=========================================================
  // Configuration
  //=========================================================

  readConfiguration(config) {
    config['audioEnabled'] = this.isEnabled();
    config['audioVolume'] = this.getVolume();
    config['audioChannels'] = arrayToProperties(channels, this.isChannelEnabled, this);
  }

  writeConfiguration(config) {
    if (config['audioEnabled'] !== undefined) this.setEnabled(config['audioEnabled']);
    if (config['audioVolume'] !== undefined) this.setVolume(config['audioVolume']);
    if (config['audioChannels'] !== undefined) forEachProperty(config['audioChannels'], this.setChannelEnabled, this);
  }

}
