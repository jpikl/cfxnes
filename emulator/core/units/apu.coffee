logger = require("../utils/logger").get()

FRAME_COUNTER_MAX = 14915

###########################################################
# Audio processing unit
###########################################################

class APU

    @dependencies: [ "cpu" ]

    init: (cpu) ->
        @cpu = cpu

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
    # APU tick
    ###########################################################

    tick: ->
        @$tickFrameCounter()
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
        if @frameStep is 0 and @frameIrqEnabled and not @frameFiveStepMode
            @cpu.sendIRQ()

    tickHalfFrame: ->

    tickQuarterFrame: ->

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
