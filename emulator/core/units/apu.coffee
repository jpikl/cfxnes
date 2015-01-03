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
        @pulse0 = new PulseChannel 0
        @pulse1 = new PulseChannel 1

    ###########################################################
    # Power-up state initialization
    ###########################################################

    powerUp: ->
        logger.info "Reseting APU"
        @stopRecording()
        @setNTSCMode true
        @resetRegisters()

    resetRegisters: ->
        @writeFrameCounter 0

    setNTSCMode: (ntscMode) ->
        @frameCounterMax4 = if ntscMode then [ 7457, 7456, 7458, 7457,    1, 1 ] else [ 8313, 8314, 8312, 8313,    1, 1 ] # 4-step frame counter
        @frameCounterMax5 = if ntscMode then [ 7457, 7456, 7458, 7458, 7452, 1 ] else [ 8313, 8314, 8312, 8314, 8312, 1 ] # 5-step frame counter

    ###########################################################
    # Frame counter register
    ###########################################################

    writeFrameCounter: (value) ->
        @frameFiveStepMode = value & 0x80 isnt 0
        @frameIrqEnabled = value & 0x40 isnt 0
        @frameIrqActive = @frameIrqActive and @frameIrqEnabled or false # Disabling IRQ clears IRQ flag
        @frameCounter = @getFrameCounterMax()
        @frameStep = 0
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

    writePulseDutyEnvelope: (channel, value) ->
        @$getPulse(channel).writeDutyEnvelope value

    writePulseSweep: (channel, value) ->
        @$getPulse(channel).writeSweep value

    writePulseTimer: (channel, value) ->
        @$getPulse(channel).writeTimer value

    writePulseLengthCounter: (channel, value) ->
        @$getPulse(channel).writeLengthCounter value

    getPulse: (channel) ->
        if channel then @pulse0 else @pulse1

    ###########################################################
    # Status register
    ###########################################################

    writeStatus: (value) ->
        @pulse0.setEnabled value & 0x01 isnt 0
        @pulse1.setEnabled value & 0x02 isnt 0
        value

    readStatus: ->
        value = @$getStatus()
        @frameIrqActive = false
        value

    getStatus: ->
        (@pulse0.lengthCounter > 0)      |
        (@pulse1.lengthCounter > 0) << 1 |
        @frameIrqActive             << 6

    ###########################################################
    # APU tick
    ###########################################################

    tick: ->
        @$tickFrameCounter()
        @pulse0.tick()
        @pulse1.tick()
        @$recordOutputValue()

    tickFrameCounter: ->
        if --@frameCounter <= 0
            @tickFrameStep()

    tickFrameStep: ->
        @frameStep = (@frameStep + 1) % 6
        @frameCounter = @getFrameCounterMax()
        if @frameStep in [ 1, 2, 3, 5 ]
            @tickHalfFrame()
        if @frameStep in [ 2, 5 ]
            @tickQuarterFrame()
        if @frameStep in [ 4, 5, 0 ] and @frameIrqEnabled and not @frameFiveStepMode
            @frameIrqActive = true
        if @frameStep is 0 and @frameIrqActive
            @cpu.sendIRQ()

    tickHalfFrame: ->
        @pulse0.tickHalfFrame()
        @pulse1.tickHalfFrame()

    tickQuarterFrame: ->
        @pulse0.tickQuarterFrame()
        @pulse1.tickQuarterFrame()

    ###########################################################
    # Output composition
    ###########################################################

    getOutputValue: ->
        0

    ###########################################################
    # Recording to output buffer
    ###########################################################

    startRecording: (buffer, cyclesPerSample) ->
        @outputBuffer = buffer
        @outputPosition = 0
        @cyclesPerSample = cyclesPerSample # Number of cycles after which sample is taken
        @cyclesToSample = cyclesPerSample  # Number of cycles left to take next sample (conutdown counter)

    stopRecording: ->
        @outputBuffer = null

    getRecordedSize: ->
        @outputPosition

    recordOutputValue: ->
        if @$canRecordValue() and --@cyclesToSample <= 0
            @outputBuffer[@outputPosition++] = @getOutputValue()
            @cyclesToSample = @cyclesPerSample

    canRecordValue: ->
        @outputBuffer and @outputPosition < @outputBuffer.length

module.exports = APU
