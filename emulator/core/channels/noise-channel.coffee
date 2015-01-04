logger = require("../utils/logger").get()

LENGTH_COUNTER_VALUES = require("../common/constants").APU_LENGTH_COUNTER_VALUES

TIMER_PERIODS_NTSC = [ 4, 8, 16, 32, 64, 96, 128, 160, 202, 254, 380, 508, 762, 1016, 2034, 4068 ]
TIMER_PERIODS_PAL  = [ 4, 8, 14, 30, 60, 88, 118, 148, 188, 236, 354, 472, 708,  944, 1890, 3778 ]

###########################################################
# Noise channel
###########################################################

class NoiseChannel

    powerUp: ->
        logger.info "Reseting noise channel"
        @setEnabled false
        @timerCycle = 0     # Timer counter value
        @envelopeCycle = 0  # Envelope divider counter
        @envelopeVolume = 0 # Envelope volume value
        @shiftRegister = 1  # Shift register for random noise generation (must be 1 on start)
        @writeEnvelope 0
        @writeTimer 0
        @writeLengthCounter 0

    setEnabled: (enabled) ->
        @enabled = enabled
        @lengthCounter = 0 unless enabled # Disabling channel resets length counter

    setNTSCMode: (ntscMode) ->
        @timerPeriods = if ntscMode then TIMER_PERIODS_NTSC else TIMER_PERIODS_PAL

    ###########################################################
    # Envelope / Volume register
    ###########################################################

    writeEnvelope: (value) ->
        @lengthCounterHalt = (value & 0x20) isnt 0 # Disables length counter decrementation
        @useConstantVolume = (value & 0x10) isnt 0 # 0 - envelope volume is used / 1 - constant volume is used
        @constantVolume = value & 0x0F             # Constant volume value
        @envelopeLoop = @lengthCounterHalt         # Envelope is looping (length counter hold alias)
        @envelopePeriod = @constantVolume          # Envelope duration period (constant volume alias)
        value

    ###########################################################
    # Timer register
    ###########################################################

    writeTimer: (value) ->
        @timerMode = (value & 0x80) isnt 0         # Noise generation mode
        @timerPeriod = @timerPeriods[value & 0x0F] # Timer period
        value

    ###########################################################
    # Length counter / Timer register
    ###########################################################

    writeLengthCounter: (value) ->
        @lengthCounter = LENGTH_COUNTER_VALUES[(value & 0xF8) >>> 3] if @enabled  # Length counter update
        @envelopeReset = true # Envelope and its divider will be reseted
        value

    ###########################################################
    # Tick
    ###########################################################

    tick: ->
        if --@timerCycle <= 0
            @timerCycle = @timerPeriod
            @updateShiftRegister()

    tickQuarterFrame: ->
        @updateEnvelope()

    tickHalfFrame: ->
        @updateLengthCounter()

    ###########################################################
    # Shift register
    ###########################################################

    updateShiftRegister: ->
        feedbackPosition = if @timerMode then 6 else 1
        feedbackValue = (@shiftRegister & 1) ^ ((@shiftRegister >>> feedbackPosition) & 1)
        @shiftRegister = (@shiftRegister >>> 1) | (feedbackValue << 14)

    ###########################################################
    # Envelope
    ###########################################################

    updateEnvelope: ->
        if @envelopeReset
            @envelopeReset = false
            @envelopeCycle = @envelopePeriod
            @envelopeVolume = 0xF
        else if @envelopeCycle > 0
            @envelopeCycle--
        else
            @envelopeCycle = @envelopePeriod
            if @envelopeVolume > 0
                @envelopeVolume--
            else if @envelopeLoop
                @envelopeVolume = 0xF

    ###########################################################
    # Length counter
    ###########################################################

    updateLengthCounter: ->
        if @lengthCounter > 0 and not @lengthCounterHalt
            @lengthCounter--

    ###########################################################
    # Output value
    ###########################################################

    getOutputValue: ->
        if @enabled and @lengthCounter and not (@shiftRegister & 1)
            if @useConstantVolume then @constantVolume else @envelopeVolume
        else
            0

module.exports = NoiseChannel
