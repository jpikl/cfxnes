import { arrayToProperties } from "../../core/utils/arrays";
import { logger }            from "../../core/utils/logger";
import { forEeachProperty }  from "../../core/utils/objects";

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

    init(nes) {
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
        this.processor.onaudioprocess = this.updateAudio.bind(this);
        this.nes.initAudioRecording(this.processor.bufferSize, this.context.sampleRate);
    }

    updateAudio(event) {
        var outputBuffer = event.outputBuffer;
        var sourceBuffer = this.nes.readAudioBuffer();
        var outputChannel = outputBuffer.getChannelData(0);
        for (var i = 0; i < outputChannel.length; i++) {
            outputChannel[i] = this.volume * sourceBuffer[i];
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
            if (this.enabled && this.playing) {
                this.nes.startAudioRecording(this.context.sampleRate / this.speed);
                this.processor.connect(this.context.destination);
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
            logger.info(`Audio channel '${channel}' ${enabled ? 'on' : 'off'}`);
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
        if (this.volume != volume) {
            this.volume = Math.max(0.0, Math.min(volume, 1.0));
            logger.info(`Setting audio volume to ${~~(100 * this.volume)}%`);
        }
    }

    getVolume() {
        return this.volume;
    }

    //=========================================================
    // Configuration reading / writing
    //=========================================================

    readConfiguration() {
        logger.info("Reading audio manager configuration");
        return {
            "enabled":  this.isEnabled(),
            "volume":   this.getVolume(),
            "channels": arrayToProperties(channels, this.isChannelEnabled, this)
        }
    }

    writeConfiguration(config) {
        if (config) {
            logger.info("Writing audio manager configuration");
            this.setEnabled(config["enabled"]);
            this.setVolume(config["volume"]);
            if (config["channels"]) {
                forEeachProperty(config["channels"], this.setChannelEnabled, this);
            }
        }
    }

}

AudioManager["dependencies"] = [ "nes" ];
