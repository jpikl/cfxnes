###########################################################
# Triangle channel
###########################################################

LENGTH_COUNTER_VALUES = require("../common/constants").APU_LENGTH_COUNTER_VALUES

DUTY_WAVEFORM = [
    15, 14, 13, 12, 11, 10,  9,  8,  7,  6,  5,  4,  3,  2,  1,  0
     0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15
]

class TriangleChannel

    constructor: (@channelId) ->
        @setEnabled false
        @timerCycle = 0    # Timer counter value
        @timerPeriod = 0   # Timer counter reset value
        @dutyPosition = 0  # Output waveform position (never being reseted)
        @linearCounter = 0 # Linear counter value
        @writeLinearCounter 0
        @writeTimer 0
        @writeLengthCounter 0

    setEnabled: (enabled) ->
        @enabled = enabled
        @lengthCounter = 0 unless enabled # Disabling channel resets length counter

    ###########################################################
    # Linear counter register
    ###########################################################

    writeLinearCounter: (value) ->
        @lengthCounterHalt = (value & 0x80) isnt 0    # Disables length counter decrementation
        @linearCounterMax = value & 0x7F              # Linear counter initial value
        @linearCounterControl = @lengthCounterHalt    # Linear counter control flag (length counter halt alias)
        value

    ###########################################################
    # Timer register
    ###########################################################

    writeTimer: (value) ->
        @timerPeriod = (@timerPeriod & 0x700) | (value & 0xFF) # Lower 8 bits of timer
        value

    ###########################################################
    # Length counter / Timer register
    ###########################################################

    writeLengthCounter: (value) ->
        @timerPeriod = (@timerPeriod & 0x0FF) | (value & 0x7) << 8                # Higher 3 bits of timer
        @lengthCounter = LENGTH_COUNTER_VALUES[(value & 0xF8) >>> 3] if @enabled  # Length counter update
        @linearCounterReset = true                                                # Linear counter will be reseted
        value

    ###########################################################
    # Tick
    ###########################################################

    tick: ->
        if --@timerCycle <= 0
            @timerCycle = @timerPeriod + 1 # Ticks at the same rate as CPU
            @dutyPosition = (@dutyPosition + 1) & 0x1F

    tickQuarterFrame: ->
        @updateLinearCounter()

    tickHalfFrame: ->
        @updateLengthCounter()

    ###########################################################
    # Linear counter
    ###########################################################

    updateLinearCounter: ->
        if @linearCounterReset
            @linearCounter = @linearCounterMax
        else if @linearCounter > 0
            @linearCounter--
        unless @linearCounterControl
            @linearCounterReset = false

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
        # High frequencies are considered beyond hearing (causes ugly whistle in some games)
        if @enabled and @lengthCounter and @linearCounter and @timerPeriod > 3
            DUTY_WAVEFORM[@dutyPosition]
        else
            0

module.exports = TriangleChannel
