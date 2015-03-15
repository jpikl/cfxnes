var BUFFER_SIZE, CHANNEL_ALIASES, DEFAULT_ENABLED, DEFAULT_VOLUME, logger,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

logger = require("../../core/utils/logger").get();

BUFFER_SIZE = 4096;

DEFAULT_ENABLED = true;

DEFAULT_VOLUME = 1.0;

CHANNEL_ALIASES = {
  "pulse1": 0,
  "pulse2": 1,
  "triangle": 2,
  "noise": 3,
  "dmc": 4
};

function AudioManager() {
  this.updateAudio = bind(this.updateAudio, this);
}

AudioManager.dependencies = ["nes"];

AudioManager.prototype.init = function(nes) {
  var channel;
  logger.info("Initializing audio manager");
  this.nes = nes;
  this.channels = (function() {
    var results;
    results = [];
    for (channel in CHANNEL_ALIASES) {
      results.push(channel);
    }
    return results;
  })();
  if (this.isSupported()) {
    this.createAudio();
  }
  return this.setDefaults();
};

AudioManager.prototype.setDefaults = function() {
  var channel, j, len, ref, results;
  logger.info("Using default audio configuration");
  this.setEnabled(DEFAULT_ENABLED);
  this.setVolume(DEFAULT_VOLUME);
  ref = this.channels;
  results = [];
  for (j = 0, len = ref.length; j < len; j++) {
    channel = ref[j];
    results.push(this.setChannelEnabled(channel, DEFAULT_ENABLED));
  }
  return results;
};

AudioManager.prototype.isSupported = function() {
  return typeof AudioContext !== "undefined" && AudioContext !== null;
};

AudioManager.prototype.createAudio = function() {
  logger.info("Creating audio context");
  this.context = new AudioContext;
  this.processor = this.context.createScriptProcessor(BUFFER_SIZE, 0, 1);
  this.processor.onaudioprocess = this.updateAudio;
  return this.nes.initAudioRecording(BUFFER_SIZE, this.context.sampleRate);
};

AudioManager.prototype.updateAudio = function(event) {
  var i, j, outputBuffer, outputChannel, ref, sourceBuffer;
  outputBuffer = event.outputBuffer;
  sourceBuffer = this.nes.readAudioBuffer();
  outputChannel = outputBuffer.getChannelData(0);
  for (i = j = 0, ref = BUFFER_SIZE; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
    outputChannel[i] = this.volume * sourceBuffer[i];
  }
  return void 0;
};

AudioManager.prototype.setEnabled = function(enabled) {
  if (enabled == null) {
    enabled = DEFAULT_ENABLED;
  }
  logger.info("Audio " + (enabled ? 'on' : 'off'));
  this.enabled = enabled;
  return this.updateState();
};

AudioManager.prototype.isEnabled = function() {
  return this.enabled;
};

AudioManager.prototype.setPlaying = function(playing) {
  logger.info("Audio " + (playing ? 'resumed' : 'paused'));
  this.playing = playing;
  return this.updateState();
};

AudioManager.prototype.setSpeed = function(speed) {
  logger.info("Setting audio recording speed to " + speed + "x");
  this.speed = speed;
  return this.updateState();
};

AudioManager.prototype.updateState = function() {
  if (!this.isSupported()) {
    return;
  }
  if (this.enabled && this.playing) {
    this.nes.startAudioRecording(this.context.sampleRate / this.speed);
    return this.processor.connect(this.context.destination);
  } else {
    this.nes.stopAudioRecording();
    return this.processor.disconnect();
  }
};

AudioManager.prototype.setChannelEnabled = function(channel, enabled) {
  if (enabled == null) {
    enabled = DEFAULT_ENABLED;
  }
  if (CHANNEL_ALIASES[channel] != null) {
    logger.info("Audio channel '" + channel + "' " + (enabled ? 'on' : 'off'));
    return this.nes.setChannelEnabled(CHANNEL_ALIASES[channel], enabled);
  }
};

AudioManager.prototype.isChannelEnabled = function(channel) {
  return this.nes.isChannelEnabled(CHANNEL_ALIASES[channel]);
};

AudioManager.prototype.setVolume = function(volume) {
  if (volume == null) {
    volume = DEFAULT_VOLUME;
  }
  this.volume = Math.max(0.0, Math.min(volume, 1.0));
  return logger.info("Setting audio volume to " + (~~(100 * this.volume)) + "%");
};

AudioManager.prototype.getVolume = function() {
  return this.volume;
};

AudioManager.prototype.readConfiguration = function(config) {
  var channel, enabled, ref, results;
  logger.info("Reading audio manager configuration");
  if (config["audio"]) {
    this.setEnabled(config["audio"]["enabled"]);
    this.setVolume(config["audio"]["volume"]);
    ref = config["audio"]["channels"];
    results = [];
    for (channel in ref) {
      enabled = ref[channel];
      results.push(this.setChannelEnabled(channel, enabled));
    }
    return results;
  }
};

AudioManager.prototype.writeConfiguration = function(config) {
  var channel, j, len, ref, results;
  logger.info("Writing audio manager configuration");
  config["audio"] = {
    "enabled": this.isEnabled(),
    "volume": this.getVolume(),
    "channels": {}
  };
  ref = this.channels;
  results = [];
  for (j = 0, len = ref.length; j < len; j++) {
    channel = ref[j];
    results.push(config["audio"]["channels"][channel] = this.isChannelEnabled(channel));
  }
  return results;
};

module.exports = AudioManager;
