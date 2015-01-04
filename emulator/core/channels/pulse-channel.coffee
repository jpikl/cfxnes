###########################################################
# Pulse channel
###########################################################

LENGTH_COUNTER_VALUES = require("../common/constants").APU_LENGTH_COUNTER_VALUES

DUTY_WAVEFORMS = [
    [ 0, 1, 0, 0, 0, 0, 0, 0 ] # _X______ (12.5%)
    [ 0, 1, 1, 0, 0, 0, 0, 0 ] # _XX_____ (25%)
    [ 0, 1, 1, 1, 1, 0, 0, 0 ] # _XXXX___ (50%)
    [ 1, 0, 0, 1, 1, 1, 1, 1 ] # X__XXXXX (25% negated)
]

class PulseChannel

    constructor: (@channelId) ->
        @setEnabled false
        @setDutyEnvelope 0
        @setSweep 0
        @setTimer 0
        @setLengthCounter 0
        @updateState()
        @updateVolume()

    setEnabled: (enabled) ->
        @enabled = enabled
        @lengthCounter = 0 unless enabled # Disabling channel resets length counter

    ###########################################################
    # Duty / Envelope / Volume register
    ###########################################################

    writeDutyEnvelope: (value) ->
        @setDutyEnvelope value
        @updateState()
        @updateVolume()
        value

    setDutyEnvelope: (value) ->
        @dutySelection = (value & 0xC0) >>> 6      # Selects output waveform
        @lengthCounterHalt = (value & 0x20) isnt 0 # Disables length counter decrementation
        @useConstantVolume = (value & 0x10) isnt 0 # 0 - envelope volume is used / 1 - constant volume is used
        @constantVolume = value & 0x0F             # Constant volume value
        @envelopeLoop = @lengthCounterHalt         # Envelope is looping (length counter hold alias)
        @envelopePeriod = @constantVolume          # Envelope duration period (constant volume alias)
        @envelopeCycle or= 0                       # Cycle of envelope divider
        @envelopeVolume or= 0                      # Envelope volume value

    ###########################################################
    # Sweep register
    ###########################################################

    writeSweep: (value) ->
        @setSweep value
        @updateState()
        value

    setSweep: (value) ->
        @sweepEnabled = (value & 0x80) isnt 0 # Sweeping enabled
        @sweepPeriod = (value & 0x70) >>> 4   # Period after which sweep is applied
        @sweepNegate = (value & 0x08) isnt 0  # 0 - sweep is added to timer period / 1 - sweep is subtracted from timer period
        @sweepShift = value & 0x07            # Shift of timer period when computing sweep
        @sweepReset = true                    # Sweep counter will be reseted
        @sweepCycle or= 0                     # Sweep counter

    ###########################################################
    # Timer register
    ###########################################################

    writeTimer: (value) ->
        @setTimer value
        @updateState()
        value

    setTimer: (value) ->
         @timerPeriod = (@timerPeriod or 0) & 0x700 | (value & 0xFF) # Lower 8 bits of timer
         @timerCycle or= 0

    ###########################################################
    # Length counter / Timer register
    ###########################################################

    writeLengthCounter: (value) ->
        @setLengthCounter value
        @updateState()
        value

    setLengthCounter: (value) ->
        @timerPeriod = (@timerPeriod or 0) & 0x0FF | (value & 0x7) << 8           # Higher 3 bits of timer
        @lengthCounter = LENGTH_COUNTER_VALUES[(value & 0xF8) >>> 3] if @enabled  # Length counter update
        @dutyPosition = 0     # Output waveform position is reseted
        @envelopeReset = true # Envelope and its divider will be reseted

    ###########################################################
    # Tick
    ###########################################################

    tick: ->
        # The timer actually counts T, T-1, ... 0, 1, ... T
        # and clocks waveform generator (duty position) when it goes from T-1 to T.
        # We are emulating it as 2*T, 2*T-1, ..., 0.
        if --@timerCycle <= 0
            @timerCycle = (@timerPeriod + 1) << 1 # Real period is T + 1 APU cycles
            @dutyPosition = (@dutyPosition + 1) & 0x7

    tickQuarterFrame: ->
        @updateEnvelope()
        @updateVolume()
        @updateState()

    tickHalfFrame: ->
        @updateLengthCounter()
        @updateSweep()
        @updateState()

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
            @timerPeriod += @getSweep() if @sweepEnabled and @sweepShift and @timerPeriodValid
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

    ###########################################################
    # State
    ###########################################################

    updateState: ->
        @timerPeriodValid = @timerPeriod >= 0x8 and @timerPeriod + @getSweep() < 0x800

    updateVolume: ->
        @volume = if @useConstantVolume then @constantVolume else @envelopeVolume

    ###########################################################
    # Output value
    ###########################################################

    getOutputValue: ->
        if @enabled and @timerPeriodValid and @lengthCounter
            @volume * DUTY_WAVEFORMS[@dutySelection][@dutyPosition]
        else
            0

module.exports = PulseChannel
