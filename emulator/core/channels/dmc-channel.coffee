logger = require("../utils/logger").get()

TIMER_PERIODS_NTSC = [ 428, 380, 340, 320, 286, 254, 226, 214, 190, 160, 142, 128, 106,  84,  72,  54 ]
TIMER_PERIODS_PAL  = [ 398, 354, 316, 298, 276, 236, 210, 198, 176, 148, 132, 118,  98,  78,  66,  50 ]

###########################################################
# DMC channel
###########################################################

class DMCChannel

    constructor: (@cpu, @cpuMemory) ->

    powerUp: ->
        logger.info "Reseting DMC channel"
        @setEnabled false
        @timerCycle = 0        # Timer counter value
        @sampleBuffer = null   # Buffered sample data, readed from memory (null = buffered data not available)
        @shiftRegister = null  # Shift register for processing buffered sample data (null = output is silenced)
        @shiftRegisterBits = 0 # Bits remaining in shift register
        @writeFlagsTimer 0
        @writeOutputLevel 0
        @writeSampleAddress 0
        @writeSampleLength 0

    setEnabled: (enabled) ->
        @enabled = enabled
        @irqActive = false # Changing enablement ($4015 write) clears IRQ flag
        if not enabled
            @sampleRemainingLength = 0             # Disabling channel stops sample data reading
        else if @sampleRemainingLength is 0
            @sampleCurrentAddress = @sampleAddress # Enabling channel starts sample data reading unless is already in progress
            @sampleRemainingLength = @sampleLength

    setNTSCMode: (ntscMode) ->
        @timerPeriods = if ntscMode then TIMER_PERIODS_NTSC else TIMER_PERIODS_PAL

    ###########################################################
    # Registers writing
    ###########################################################

    writeFlagsTimer: (value) ->
        @irqEnabled = (value & 0x80) isnt 0        # IRQ enabled flag
        @irqActive and= @irqEnabled                # Disabling IRQ clears IRQ flag
        @sampleLoop = (value & 0x40) isnt 0        # Sample looping flag
        @timerPeriod = @timerPeriods[value & 0x0F] # Timer counter reset value
        value

    writeOutputLevel: (value) ->
        @outputValue = value & 0x7F # Direct output level
        value

    writeSampleAddress: (value) ->
        @sampleAddress = 0xC000 | ((value & 0xFF) << 6) # Address is constructed as 11AAAAAA.AA000000 where AAAAAAAA are bits of written value
        value

    writeSampleLength: (value) ->
        @sampleLength = (value & 0xFF) << 4 | 0x01 # Length is constructed as LLLL.LLLL0001 where LLLLLLLL are bits of written value
        value

    ###########################################################
    # Tick
    ###########################################################

    tick: ->
        if --@timerCycle <= 0
            @timerCycle = @timerPeriod
            @updateSample()
        @cpu.requestIRQ if @irqActive

    ###########################################################
    # Sample processing
    ###########################################################

    updateSample: ->
        @updateSampleBuffer()
        @updateShiftRegister()
        @updateOutputValue()

    updateSampleBuffer: ->
        # Read next sample into buffer when it's empty and the read is requested
        if @sampleBuffer is null and @sampleRemainingLength > 0
            @sampleBuffer = @cpuMemory.read @sampleCurrentAddress
            if @sampleCurrentAddress < 0xFFFF
                @sampleCurrentAddress++
            else
                @sampleCurrentAddress = 0x8000 # Address increment wrap
            if --@sampleRemainingLength <= 0
                if @sampleLoop
                    @sampleCurrentAddress = @sampleAddress # Re-read the same sample again
                    @sampleRemainingLength = @sampleLength
                else if @irqEnabled
                    @irqActive = true # Reading of sample was finished

    updateShiftRegister: ->
        # Countinuous reload of buffer to shift register (even when the output is silenced)
        if --@shiftRegisterBits <= 0
            @shiftRegisterBits = 8
            @shiftRegister = @sampleBuffer
            @sampleBuffer = null

    updateOutputValue: ->
        # Update output value from bit 0 of the shift register.
        # Null shift register means silenced output.
        if @shiftRegister isnt null
            if @shiftRegister & 0x1
                @outputValue += 2 if @outputValue <= 125 # We cannot go over 127
            else
                @outputValue -=2 if @outputValue >= 2 # We cannot go bellow 0
            @shiftRegister >>>= 1

    ###########################################################
    # Output value
    ###########################################################

    getOutputValue: ->
        @outputValue

module.exports = DMCChannel
