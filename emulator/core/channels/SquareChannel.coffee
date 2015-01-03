###########################################################
# Square channel
###########################################################

DUTY_WAVEFORMS = [
    [ 0, 1, 0, 0, 0, 0, 0, 0 ] # _X______ (12.5%)
    [ 0, 1, 1, 0, 0, 0, 0, 0 ] # _XX_____ (25%)
    [ 0, 1, 1, 1, 1, 0, 0, 0 ] # _XXXX___ (50%)
    [ 1, 0, 0, 1, 1, 1, 1, 1 ] # X__XXXXX (25% negated)
]

class SquareChannel

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
        @dutySelection = (value >>> 6) & 0x03
        @useConstantVolume = value & 0x10 isnt 0 # 0 - envelope is volume / 1 - constant volume
        @constantVolume = value & 0x0F
        @envelopePeriod = @constantVolume # Alias

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
        @timerPeriod = (@timerPeriod or 0) & 0x0FF | (value & 0x3) << 8 # High 3 bits
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
        @updateVolume()
        @updateState()

    tickHalfFrame: ->
        @updateSweep()
        @updateState()

    updateState: ->
        @timerPeriodValid = @timerPeriod > 0x8 and @timerPeriod + @getSweep() < 0x800

    updateVolume: ->
        @volume = if @useConstantVolume then @constantVolume else @envelope

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
    # Output value
    ###########################################################

    getOutputValue: ->
        if @enabled and @timerPeriodValid
            @volume * DUTY_WAVEFORMS[@dutySelection][@dutyPosition]
        else
            0

module.exports = SquareChannel
