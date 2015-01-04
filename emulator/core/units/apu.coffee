PulseChannel = require "../channels/pulse-channel"

logger = require("../utils/logger").get()

FRAME_COUNTER_MAX = 14915

###########################################################
# Audio processing unit
###########################################################

class APU

    @dependencies: [ "cpu" ]

    init: (cpu) ->
        @cpu = cpu
        @pulse1 = new PulseChannel 1
        @pulse2 = new PulseChannel 2

    ###########################################################
    # Power-up state initialization
    ###########################################################

    powerUp: ->
        logger.info "Reseting APU"
        @setNTSCMode true
        @resetRegisters()
        @stopRecording()

    resetRegisters: ->
        @writeFrameCounter 0

    setNTSCMode: (ntscMode) ->
        @frameCounterMax4 = if ntscMode then [ 7457, 7456, 7458, 7457,    1, 1 ] else [ 8313, 8314, 8312, 8313,    1, 1 ] # 4-step frame counter
        @frameCounterMax5 = if ntscMode then [ 7457, 7456, 7458, 7458, 7452, 1 ] else [ 8313, 8314, 8312, 8314, 8312, 1 ] # 5-step frame counter
        @cpuFrequency = if ntscMode then 1789773 else 1662607

    ###########################################################
    # Frame counter register
    ###########################################################

    writeFrameCounter: (value) ->
        @frameFiveStepMode = (value & 0x80) isnt 0
        @frameIrqEnabled = (value & 0x40) is 0
        @frameIrqActive = @frameIrqActive and @frameIrqEnabled or false # Disabling IRQ clears IRQ flag
        @frameStep = 0
        @frameCounter = @getFrameCounterMax()
        if @frameFiveStepMode
            @tickHalfFrame()
            @tickQuarterFrame()
        value

    getFrameCounterMax: ->
        if @frameFiveStepMode
            @frameCounterMax5[@frameStep]
        else
            @frameCounterMax4[@frameStep]

    ###########################################################
    # Pulse channel registers
    ###########################################################

    writePulseDutyEnvelope: (channelId, value) ->
        @$getPulse(channelId).writeDutyEnvelope value

    writePulseSweep: (channelId, value) ->
        @$getPulse(channelId).writeSweep value

    writePulseTimer: (channelId, value) ->
        @$getPulse(channelId).writeTimer value

    writePulseLengthCounter: (channelId, value) ->
        @$getPulse(channelId).writeLengthCounter value

    getPulse: (channelId) ->
        if channelId is 1 then @pulse1 else @pulse2

    ###########################################################
    # Status register
    ###########################################################

    writeStatus: (value) ->
        @pulse1.setEnabled (value & 0x01) isnt 0
        @pulse2.setEnabled (value & 0x02) isnt 0
        value

    readStatus: ->
        value = @$getStatus()
        @frameIrqActive = false
        value

    getStatus: ->
        (@pulse1.lengthCounter > 0)      |
        (@pulse2.lengthCounter > 0) << 1 |
        @frameIrqActive             << 6

    ###########################################################
    # APU tick
    ###########################################################

    tick: ->
        @$tickFrameCounter()
        @pulse1.tick()
        @pulse2.tick()
        @$recordOutputValue()

    tickFrameCounter: ->
        if --@frameCounter <= 0
            @tickFrameStep()

    tickFrameStep: ->
        @frameStep = (@frameStep + 1) % 6
        @frameCounter = @getFrameCounterMax()
        if @frameStep in [ 1, 2, 3, 5 ]
            @tickQuarterFrame()
        if @frameStep in [ 2, 5 ]
            @tickHalfFrame()
        if @frameStep in [ 4, 5, 0 ] and @frameIrqEnabled and not @frameFiveStepMode
            @frameIrqActive = true
        if @frameStep is 0 and @frameIrqActive
            @cpu.sendIRQ()

    tickHalfFrame: ->
        @pulse1.tickHalfFrame()
        @pulse2.tickHalfFrame()

    tickQuarterFrame: ->
        @pulse1.tickQuarterFrame()
        @pulse2.tickQuarterFrame()

    ###########################################################
    # Output composition
    ###########################################################

    getOutputValue: ->
        @getPulseOutputValue()

    getPulseOutputValue: ->
        pulse1Value = @pulse1.getOutputValue()
        pulse2value = @pulse2.getOutputValue()
        if pulse1Value or pulse2value
            95.88 / (8128 / (pulse1Value + pulse2value) + 100)
        else
            0

    ###########################################################
    # Audio samples recording
    ###########################################################

    initRecording: (bufferSize, sampleRate) ->
        @recordingBuffer = new Float32Array bufferSize # Audio samples which are curreltly being recorded
        @recordingPosition = 0
        @recordingCycle = 0
        @outputBuffer = new Float32Array bufferSize    # Cached audio samples, ready for output to sound card
        @outputBufferAvailable = false
        @sampleRate = sampleRate

    startRecording: ->
        throw "Cannot start audio recording without initialization" unless @recordingBuffer
        @recordingActive = true

    stopRecording: ->
        @recordingActive = false

    recordOutputValue: ->
        if @recordingActive
            newRecordingPosition = ~~(@recordingCycle++ * @sampleRate / @cpuFrequency)
            if newRecordingPosition > @recordingPosition
                @recordingPosition = newRecordingPosition
                @recordingBuffer[@recordingPosition] = @getOutputValue()
                if @recordingPosition >= @recordingBuffer.length - 1
                    @swapOutputBuffer()
                    @recordingPosition = 0
                    @recordingCycle = 0
        # TODO handle buffer overflow by adjusting sampleRate

    readOutputBuffer: ->
        @completeOutputBuffer() unless @outputBufferAvailable # Buffer overflow
        @outputBufferAvailable = false
        @outputBuffer

    completeOutputBuffer: ->
        while @recordingPosition < @recordingBuffer.length
            @recordingBuffer[@recordingPosition++] = 0
        @swapOutputBuffer()

    swapOutputBuffer: ->
        [ @recordingBuffer, @outputBuffer ] = [ @outputBuffer, @recordingBuffer ]
        @outputBufferAvailable = true

module.exports = APU
