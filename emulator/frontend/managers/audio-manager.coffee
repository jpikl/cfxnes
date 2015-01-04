logger = require("../../core/utils/logger").get()

BUFFER_SIZE = 4096

DEFAULT_ENABLED = true
DEFAULT_VOLUME = 1.0

###########################################################
# Audio manager
###########################################################

class AudioManager

    @dependencies = [ "nes" ]

    @isAudioSupported: ->
        AudioContext?

    ###########################################################
    # Ininitalization
    ###########################################################

    init: (nes) ->
        logger.info "Initializing audio manager"
        @nes = nes
        @createAudio() if AudioManager.isAudioSupported()
        @setDefaults()

    setDefaults: ->
        logger.info "Using default audio configuration"
        @setEnabled DEFAULT_ENABLED
        @setVolume DEFAULT_VOLUME

    ###########################################################
    # Audio context
    ###########################################################

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

    setActive: (active) ->
        logger.info "Audio #{if active then 'resumed' else 'paused'}"
        @active = active
        @updateState()

    updateState: ->
        if @enabled and @active
            @nes.startAudioRecording()
            @processor?.connect @context.destination
        else
            @nes.stopAudioRecording()
            @processor?.disconnect()

    ###########################################################
    # Audio volume
    ###########################################################

    setVolume: (volume = DEFAULT_VOLUME) ->
        @volume = Math.max 0.0, Math.min(volume, 1.0)

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

    writeConfiguration: (config) ->
        logger.info "Writing audio manager configuration"
        config["audio"] =
            "enabled": @isEnabled()
            "volume":  @getVolume()

module.exports = AudioManager
