logger = require("../../core/utils/logger").get()

# APU ticks at CPU frequency = 1.789773 MHz (for NTSC; PAL is 1.662607 MHz).
# Expected output channel rate = 441000 Hz (could be possibly lower) is cca 40x slower than CPU frequency.
# Than means to generate output value (at least) every 40th APU cycle.
# We do it every 20th APU cycle and then we interpolate the result output value.
# Than means the source buffer (filled by APU) must be at least 2 as bigger as the output buffer (sent to sound card).
CYCLES_PER_SAMPLE = 20
OUTPUT_BUFFER_SIZE = 4096 # or 8192
SOURCE_BUFFER_SIZE = ~~(2.5 * OUTPUT_BUFFER_SIZE)

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
        @processor = @context.createScriptProcessor OUTPUT_BUFFER_SIZE, 0, 1 # 0 input channels / 1 output channel
        @processor.onaudioprocess = @updateAudio
        @sourceBuffer = new Float32Array SOURCE_BUFFER_SIZE

    updateAudio: (event) =>
        @copySourceBuffer event.outputBuffer
        @nes.startAudioRecording @sourceBuffer, CYCLES_PER_SAMPLE

    copySourceBuffer: (outputBuffer) ->
        outputData = outputBuffer.getChannelData 0
        outputSize = outputBuffer.length
        sourceSize = @nes.getRecordedAudioSize()
        sizeRatio = sourceSize / outputSize
        for outputPosition in [0...outputSize]
            sourcePosition = ~~(outputPosition * sizeRatio)  # Really dummy interpolation
            sourceValue = @sourceBuffer[sourcePosition] or 0
            outputData[outputPosition] = @volume * sourceValue
        undefined

    ###########################################################
    # Audio state
    ###########################################################

    setEnabled: (enabled = DEFAULT_ENABLED) ->
        logger.info "Audio #{if enabled then 'on' else 'off'}"
        @enabled = enabled and false # Not fully implemented yet
        @updateState()

    isEnabled: ->
        @enabled

    setActive: (active) ->
        logger.info "Audio #{if active then 'resumed' else 'paused'}"
        @active = active
        @updateState()

    updateState: ->
        if @enabled and @active
            @nes.startAudioRecording @sourceBuffer, CYCLES_PER_SAMPLE
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
