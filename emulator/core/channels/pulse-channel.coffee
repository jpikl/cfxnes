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
        @setEnabled true
        @setDutyEnvelope 0
        @setSweep 0
        @setTimer 0
        @setLenghtCounter 0
        @updateState()
        @updateVolume()

    setEnabled: (enabled) ->
        @enabled = enabled

    ###########################################################
    # Duty / Envelope / Volume register
    ###########################################################

    writeDutyEnvelope: (value) ->
        @setDutyEnvelope value
        @updateState()
        @updateVolume()
        value

    setDutyEnvelope: (value) ->
        @dutySelection = (value & 0xC0) >> 6
        @lengthCounterHalt = value & 0x20 isnt 0 # Disables length counter decrementation
        @envelopeLoop = @lengthCounterHalt       # Envelope is looping (length counter hold alias)
        @useConstantVolume = value & 0x10 isnt 0 # 0 - envelope itself is volume / 1 - volume is constant value
        @constantVolume = value & 0x0F           # Constant value of output volume
        @envelopePeriod = @constantVolume        # Envelope duration period (constant volume alias)

    ###########################################################
    # Sweep register
    ###########################################################

    writeSweep: (value) ->
        @setSweep value
        @updateState()
        value

    setSweep: (value) ->
        @sweepEnabled = value & 0x80 isnt 0
        @sweepPeriod = (value & 0x70) >>> 4
        @sweepNegate = value & 0x08 isnt 0
        @sweepShift = value & 0x07
        @sweepReload = true
        @sweepCycle or= 0

    ###########################################################
    # Timer register
    ###########################################################

    writeTimer: (value) ->
        @setTimer value
        @updateState()
        value

    setTimer: (value) ->
         @timerPeriod = (@timerPeriod or 0) & 0x700 | (value & 0xFF) # Low 8 bits

    ###########################################################
    # Length counter / Timer register
    ###########################################################

    writeLenghtCounter: (value) ->
        @setTimer value
        @updateState()
        value

    setLenghtCounter: (value) ->
        @timerPeriod = (@timerPeriod or 0) & 0x0FF | (value & 0x7) << 8 # High 3 bits
        @lengthCounter = (value & 0xF8) >>> 3
        @dutyPosition = 0

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
        if @sweepCycle is 0 and @sweepEnabled
            @timerPeriod += @getSweep() if @timerPeriodValid
            @sweepCycle = @sweepPeriod
        else if @sweepCycle > 0
            @sweepCycle--
        if @sweepReload
            @sweepCycle = @sweepPeriod
            @sweepReload = false
        @updateState()

    getSweep: ->
        sweep = @timerPeriod >> @sweepShift
        if @sweepNegate then -(sweep - @channelId) else sweep # Square channel 1 adjusts negative sweep by -1

    ###########################################################
    # State
    ###########################################################

    updateState: ->
        @timerPeriodValid = @timerPeriod > 0x8 and @timerPeriod + @getSweep() < 0x800

    updateVolume: ->
        @volume = if @useConstantVolume then @constantVolume else @envelope

    ###########################################################
    # Output value
    ###########################################################

    getOutputValue: ->
        if @enabled and @timerPeriodValid and @lengthCounter
            @volume * DUTY_WAVEFORMS[@dutySelection][@dutyPosition]
        else
            0

module.exports = PulseChannel
