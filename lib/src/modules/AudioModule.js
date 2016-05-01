// jscs:disable disallowQuotedKeysInObjects, requireDotNotation

import logger from '../../../core/src/utils/logger';
import {copyArray} from '../../../core/src/utils/array';

const channelAliases = {
  'pulse1': 0,
  'pulse2': 1,
  'triangle': 2,
  'noise':  3,
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
    var defaultChannels = {'pulse1': 1, 'pulse2': 1, 'triangle': 1, 'noise': 1, 'dmc': 1};
    this.options = [
      {name: 'audioEnabled',  get: this.isEnabled,   set: this.setEnabled,  def: true},
      {name: 'audioVolume',   get: this.getVolume,   set: this.setVolume,   def: 0.5},
      {name: 'audioChannels', get: this.getChannels, set: this.setChannels, def: defaultChannels},
    ];
  }

  //=========================================================
  // Audio context
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
  // Audio volume
  //=========================================================

  setVolume(volume) {
    volume = fixVolume(volume);
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
  // Audio channels
  //=========================================================

  setChannels(volumes) {
    for (var channel in volumes) {
      this.setChannelVolume(channel, volumes[channel]);
    }
  }

  getChannels() {
    var volumes = {};
    for (var channel of Object.keys(channelAliases)) {
      volumes[channel] = this.getChannelVolume(channel);
    }
    return volumes;
  }

  setChannelVolume(channel, volume) {
    volume = fixVolume(volume);
    var channelId = channelAliases[channel];
    if (channelId != null && this.getChannelVolume(channel) !== volume) {
      logger.info(`Setting "${channel}" audio channel volume to ${~~(100 * volume)}%`);
      this.nes.setAudioChannelVolume(channelId, volume);
    }
  }

  getChannelVolume(channel) {
    return this.nes.getAudioChannelVolume(channelAliases[channel]);
  }

}

function fixVolume(volume) {
  return Math.max(0.0, Math.min(volume, 1.0));
}
