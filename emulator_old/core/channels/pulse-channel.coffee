logger = require("../utils/logger").get()

LENGTH_COUNTER_VALUES = require("../common/constants").APU_LENGTH_COUNTER_VALUES

DUTY_WAVEFORMS = [
    [ 0, 1, 0, 0, 0, 0, 0, 0 ] # _X______ (12.5%)
    [ 0, 1, 1, 0, 0, 0, 0, 0 ] # _XX_____ (25%)
    [ 0, 1, 1, 1, 1, 0, 0, 0 ] # _XXXX___ (50%)
    [ 1, 0, 0, 1, 1, 1, 1, 1 ] # X__XXXXX (25% negated)
]

###########################################################
# Pulse channel
###########################################################

class PulseChannel

    constructor: (@channelId) ->

    powerUp: ->
        logger.info "Reseting pulse channel #{@channelId}"
        @setEnabled false
        @timerCycle = 0     # Timer counter value
        @timerPeriod = 0    # Timer counter reset value
        @envelopeCycle = 0  # Envelope divider counter
        @envelopeVolume = 0 # Envelope volume value
        @sweepCycle = 0     # Sweep counter
        @writeDutyEnvelope 0
        @writeSweep 0
        @writeTimer 0
        @writeLengthCounter 0

    setEnabled: (enabled) ->
        @enabled = enabled
        @lengthCounter = 0 unless enabled # Disabling channel resets length counter

    ###########################################################
    # Registers writing
    ###########################################################

    writeDutyEnvelope: (value) ->
        @dutySelection = (value & 0xC0) >>> 6      # Selects output waveform
        @lengthCounterHalt = (value & 0x20) isnt 0 # Disables length counter decrementation
        @useConstantVolume = (value & 0x10) isnt 0 # 0 - envelope volume is used / 1 - constant volume is used
        @constantVolume = value & 0x0F             # Constant volume value
        @envelopeLoop = @lengthCounterHalt         # Envelope is looping (length counter hold alias)
        @envelopePeriod = @constantVolume          # Envelope duration period (constant volume alias)
        value

    writeSweep: (value) ->
        @sweepEnabled = (value & 0x80) isnt 0 # Sweeping enabled
        @sweepPeriod = (value & 0x70) >>> 4   # Period after which sweep is applied
        @sweepNegate = (value & 0x08) isnt 0  # 0 - sweep is added to timer period / 1 - sweep is subtracted from timer period
        @sweepShift = value & 0x07            # Shift of timer period when computing sweep
        @sweepReset = true                    # Sweep counter will be reseted
        value

    writeTimer: (value) ->
        @timerPeriod = (@timerPeriod & 0x700) | (value & 0xFF) # Lower 8 bits of timer
        value

    writeLengthCounter: (value) ->
        @timerPeriod = (@timerPeriod & 0x0FF) | (value & 0x7) << 8                # Higher 3 bits of timer
        @lengthCounter = LENGTH_COUNTER_VALUES[(value & 0xF8) >>> 3] if @enabled  # Length counter update
        @dutyPosition = 0     # Output waveform position is reseted
        @envelopeReset = true # Envelope and its divider will be reseted
        value

    ###########################################################
    # Tick
    ###########################################################

    tick: ->
        if --@timerCycle <= 0
            @timerCycle = (@timerPeriod + 1) << 1 # Ticks twice slower than CPU
            @dutyPosition = (@dutyPosition + 1) & 0x7

    tickQuarterFrame: ->
        @updateEnvelope()

    tickHalfFrame: ->
        @updateLengthCounter()
        @updateSweep()

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
    # Sweep
    ###########################################################

    updateSweep: ->
        if @sweepCycle > 0
            @sweepCycle--
        else
            @timerPeriod += @getSweep() if @sweepEnabled and @sweepShift and @isTimerPeriodValid()
            @sweepCycle = @sweepPeriod
        if @sweepReset
            @sweepReset = false
            @sweepCycle = @sweepPeriod

    getSweep: ->
        sweep = @timerPeriod >>> @sweepShift
        if @sweepNegate
            if @channelId is 1 then ~sweep else -sweep # Square channel 1 use one's complement instead of the expected two's complement
        else
            sweep

    isTimerPeriodValid: ->
        @timerPeriod >= 0x8 and @timerPeriod + @getSweep() < 0x800

    ###########################################################
    # Output value
    ###########################################################

    getOutputValue: ->
        if @lengthCounter and @isTimerPeriodValid()
            volume = if @useConstantVolume then @constantVolume else @envelopeVolume
            volume * DUTY_WAVEFORMS[@dutySelection][@dutyPosition]
        else
            0

module.exports = PulseChannel
