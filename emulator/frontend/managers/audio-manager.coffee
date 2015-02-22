logger = require("../../core/utils/logger").get()

BUFFER_SIZE = 4096

DEFAULT_ENABLED = true
DEFAULT_VOLUME = 1.0

CHANNEL_ALIASES =
    "pulse1":   0
    "pulse2":   1
    "triangle": 2
    "noise":    3
    "dmc":      4

###########################################################
# Audio manager
###########################################################

class AudioManager

    @dependencies = [ "nes" ]

    ###########################################################
    # Ininitalization
    ###########################################################

    init: (nes) ->
        logger.info "Initializing audio manager"
        @nes = nes
        @channels = (channel for channel of CHANNEL_ALIASES)
        @createAudio() if @isSupported()
        @setDefaults()

    setDefaults: ->
        logger.info "Using default audio configuration"
        @setEnabled DEFAULT_ENABLED
        @setVolume DEFAULT_VOLUME
        @setChannelEnabled channel, DEFAULT_ENABLED for channel in @channels

    ###########################################################
    # Audio context
    ###########################################################

    isSupported: ->
        AudioContext?

    createAudio: ->
        logger.info "Creating audio context"
        @context = new AudioContext
        @processor = @context.createScriptProcessor BUFFER_SIZE, 0, 1 # 0 input channels / 1 output channel
        @processor.onaudioprocess = @updateAudio
        @nes.initAudioRecording BUFFER_SIZE, @context.sampleRate

    updateAudio: (event) =>
        outputBuffer = event.outputBuffer
        sourceBuffer = @nes.readAudioBuffer()
        outputChannel = outputBuffer.getChannelData 0
        outputChannel[i] = @volume * sourceBuffer[i] for i in [0...BUFFER_SIZE]
        undefined

    ###########################################################
    # Audio state
    ###########################################################

    setEnabled: (enabled = DEFAULT_ENABLED) ->
        logger.info "Audio #{if enabled then 'on' else 'off'}"
        @enabled = enabled
        @updateState()

    isEnabled: ->
        @enabled

    setPlaying: (playing) ->
        logger.info "Audio #{if playing then 'resumed' else 'paused'}"
        @playing = playing
        @updateState()

    setSpeed: (speed) ->
        logger.info "Setting audio recording speed to #{speed}x"
        @speed = speed
        @updateState()

    updateState: ->
        return unless @isSupported()
        if @enabled and @playing
            @nes.startAudioRecording @context.sampleRate / @speed
            @processor.connect @context.destination
        else
            @nes.stopAudioRecording()
            @processor.disconnect()

    ###########################################################
    # Audio channels
    ###########################################################

    setChannelEnabled: (channel, enabled = DEFAULT_ENABLED) ->
        if CHANNEL_ALIASES[channel]?
            logger.info "Audio channel '#{channel}' #{if enabled then 'on' else 'off'}"
            @nes.setChannelEnabled CHANNEL_ALIASES[channel], enabled

    isChannelEnabled: (channel) ->
        @nes.isChannelEnabled CHANNEL_ALIASES[channel]

    ###########################################################
    # Audio volume
    ###########################################################

    setVolume: (volume = DEFAULT_VOLUME) ->
        @volume = Math.max 0.0, Math.min(volume, 1.0)
        logger.info "Setting audio volume to #{~~(100 * @volume)}%"

    getVolume: ->
        @volume

    ###########################################################
    # Configuration reading / writing
    ###########################################################

    readConfiguration: (config) ->
        logger.info "Reading audio manager configuration"
        if config["audio"]
            @setEnabled config["audio"]["enabled"]
            @setVolume  config["audio"]["volume"]
            for channel, enabled of config["audio"]["channels"]
                @setChannelEnabled channel, enabled

    writeConfiguration: (config) ->
        logger.info "Writing audio manager configuration"
        config["audio"] =
            "enabled":  @isEnabled()
            "volume":   @getVolume()
            "channels": {}
        for channel in @channels
            config["audio"]["channels"][channel] = @isChannelEnabled channel

module.exports = AudioManager
