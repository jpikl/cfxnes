import { arrayToProperties, copyArray } from "../../core/utils/arrays";
import { logger }                       from "../../core/utils/logger";
import { forEeachProperty }             from "../../core/utils/objects";

const channelAliases = {
    "pulse1":   0,
    "pulse2":   1,
    "triangle": 2,
    "noise":    3,
    "dmc":      4
};

export const channels = Object.keys(channelAliases);

//=========================================================
// Audio manager
//=========================================================

export class AudioManager {

    constructor() {
        this.dependencies = ["nes"];
    }

    inject(nes) {
        logger.info("Initializing audio manager");
        this.nes = nes;
        if (this.isSupported()) {
            this.createAudio();
        }
        this.setDefaults();
    }

    setDefaults() {
        logger.info("Using default audio configuration");
        this.setEnabled();
        this.setVolume();
        for (channel of channels) {
            this.setChannelEnabled(channel);
        }
    }

    //=========================================================
    // Audio context
    //=========================================================

    isSupported() {
        return typeof AudioContext !== "undefined" && AudioContext !== null;
    }

    createAudio() {
        logger.info("Creating audio context");
        this.context = new AudioContext;
        this.processor = this.context.createScriptProcessor(4096, 0, 1); // 4K buffer, 0 input channels, 1 output channel
        this.processor.onaudioprocess = event => this.updateAudio(event);
        this.gain = this.context.createGain();
        this.gain.connect(this.context.destination);
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
            logger.info(`Audio ${enabled ? "on" : "off"}`);
            this.enabled = enabled;
            this.updateState();
        }
    }

    isEnabled() {
        return this.enabled;
    }

    setPlaying(playing) {
        if (this.playing !== playing) {
            logger.info(`Audio ${playing ? "resumed" : "paused"}`);
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
            if (this.enabled && this.playing) {
                this.nes.startAudioRecording(this.context.sampleRate / this.speed);
                this.processor.connect(this.gain);
            } else {
                this.nes.stopAudioRecording();
                this.processor.disconnect();
            }
        }
    }

    //=========================================================
    // Audio channels
    //=========================================================

    setChannelEnabled(channel, enabled = true) {
        var channelId = channelAliases[channel]
        if (channelId != null && this.isChannelEnabled(channel) !== enabled) {
            logger.info(`Audio channel '${channel}' ${enabled ? "on" : "off"}`);
            this.nes.setChannelEnabled(channelId, enabled);
        }
    }

    isChannelEnabled(channel) {
        return this.nes.isChannelEnabled(channelAliases[channel]);
    }

    //=========================================================
    // Audio volume
    //=========================================================

    setVolume(volume = 1.0) {
        volume = Math.max(0.0, Math.min(volume, 1.0));
        if (this.getVolume() != volume) {
            logger.info(`Setting audio volume to ${~~(100 * volume)}%`);
            if (this.isSupported()) {
                this.gain.gain.value = volume;
            }
            this.volume = volume;
        }
    }

    getVolume() {
        return this.volume;
    }

    //=========================================================
    // Configuration reading / writing
    //=========================================================

    getConfiguration() {
        logger.info("Getting audio manager configuration");
        return {
            "enabled":  this.isEnabled(),
            "volume":   this.getVolume(),
            "channels": arrayToProperties(channels, this.isChannelEnabled, this)
        }
    }

    setConfiguration(config) {
        if (config) {
            logger.info("Setting audio manager configuration");
            this.setEnabled(config["enabled"]);
            this.setVolume(config["volume"]);
            if (config["channels"]) {
                forEeachProperty(config["channels"], this.setChannelEnabled, this);
            }
        }
    }

}
