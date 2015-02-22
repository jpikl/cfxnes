Interrupt       = require("../common/types").Interrupt
PulseChannel    = require "../channels/pulse-channel"
TriangleChannel = require "../channels/triangle-channel"
NoiseChannel    = require "../channels/noise-channel"
DMCChannel      = require "../channels/dmc-channel"
logger          = require("../utils/logger").get()

CPU_FREQUENCY_NTSC = 1789773 # Hz
CPU_FREQUENCY_PAL = CPU_FREQUENCY_NTSC * 5 / 6  # Actually 1662607 Hz, but we need to adjust it according to screen refresh rate (50 Hz vs 60 Hz)

###########################################################
# Audio processing unit
###########################################################

class APU

    @dependencies: [ "cpu", "cpuMemory" ]

    init: (cpu, cpuMemory) ->
        @cpu = cpu
        @pulseChannel1 = new PulseChannel 1
        @pulseChannel2 = new PulseChannel 2
        @triangleChannel = new TriangleChannel
        @noiseChannel = new NoiseChannel
        @dmcChannel = new DMCChannel cpu, cpuMemory
        @channelEnabled = (true for [0..4]) # Enable flag for each channel
        @setNTSCMode true
        @stopRecording()

    ###########################################################
    # Power-up state initialization
    ###########################################################

    powerUp: ->
        logger.info "Reseting APU"
        @clearFrameIRQ()
        @pulseChannel1.powerUp()
        @pulseChannel2.powerUp()
        @triangleChannel.powerUp()
        @noiseChannel.powerUp()
        @dmcChannel.powerUp()
        @writeFrameCounter 0

    setNTSCMode: (ntscMode) ->
        @frameCounterMax4 = if ntscMode then [ 7457, 7456, 7458, 7457,    1, 1 ] else [ 8313, 8314, 8312, 8313,    1, 1 ] # 4-step frame counter
        @frameCounterMax5 = if ntscMode then [ 7457, 7456, 7458, 7458, 7452, 1 ] else [ 8313, 8314, 8312, 8314, 8312, 1 ] # 5-step frame counter
        @cpuFrequency = if ntscMode then CPU_FREQUENCY_NTSC else CPU_FREQUENCY_PAL
        @noiseChannel.setNTSCMode ntscMode
        @dmcChannel.setNTSCMode ntscMode

    activateFrameIRQ: ->
        @frameIrqActive = true
        @cpu.activateInterrupt Interrupt.IRQ_APU

    clearFrameIRQ: ->
        @frameIrqActive = false
        @cpu.clearInterrupt Interrupt.IRQ_APU

    ###########################################################
    # Frame counter register
    ###########################################################

    writeFrameCounter: (value) ->
        @frameCounterLastWrittenValue = value      # Used by CPU during reset when last value written to $4017 is written to $4017 again
        @frameFiveStepMode = (value & 0x80) isnt 0 # 0 - mode 4 (4-step counter) / 1 - mode 5 (5-step counter)
        @frameIrqDisabled = (value & 0x40) isnt 0  # IRQ generation is inhibited (during mode 4)
        @frameStep = 0                             # Step of the frame counter
        @frameCounterResetDelay = 4                # Counter should be reseted after 3 or 4 CPU cycles
        @frameCounter ?= @getFrameCounterMax()     # Frame counter first initialization
        if @frameIrqDisabled
            @clearFrameIRQ()                       # Disabling IRQ clears IRQ flag
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
        @$getPulseChannel(channelId).writeDutyEnvelope value

    writePulseSweep: (channelId, value) ->
        @$getPulseChannel(channelId).writeSweep value

    writePulseTimer: (channelId, value) ->
        @$getPulseChannel(channelId).writeTimer value

    writePulseLengthCounter: (channelId, value) ->
        @$getPulseChannel(channelId).writeLengthCounter value

    getPulseChannel: (channelId) ->
        if channelId is 1 then @pulseChannel1 else @pulseChannel2

    ###########################################################
    # Triangle channel registers
    ###########################################################

    writeTriangleLinearCounter: (value) ->
        @triangleChannel.writeLinearCounter value

    writeTriangleTimer: (value) ->
        @triangleChannel.writeTimer value

    writeTriangleLengthCounter: (value) ->
        @triangleChannel.writeLengthCounter value

    ###########################################################
    # Noise channel registers
    ###########################################################

    writeNoiseEnvelope: (value) ->
        @noiseChannel.writeEnvelope value

    writeNoiseTimer: (value) ->
        @noiseChannel.writeTimer value

    writeNoiseLengthCounter: (value) ->
        @noiseChannel.writeLengthCounter value

    ###########################################################
    # DMC channel registers
    ###########################################################

    writeDMCFlagsTimer: (value) ->
        @dmcChannel.writeFlagsTimer value

    writeDMCOutputLevel: (value) ->
        @dmcChannel.writeOutputLevel value

    writeDMCSampleAddress: (value) ->
        @dmcChannel.writeSampleAddress value

    writeDMCSampleLength: (value) ->
        @dmcChannel.writeSampleLength value

    ###########################################################
    # Channel enablement
    ###########################################################

    setChannelEnabled: (id, enabled) ->
        @channelEnabled[id] = enabled

    isChannelEnabled: (id) ->
        @channelEnabled[id]

    ###########################################################
    # Status register
    ###########################################################

    writeStatus: (value) ->
        @pulseChannel1.setEnabled (value & 0x01) isnt 0
        @pulseChannel2.setEnabled (value & 0x02) isnt 0
        @triangleChannel.setEnabled (value & 0x04) isnt 0
        @noiseChannel.setEnabled (value & 0x08) isnt 0
        @dmcChannel.setEnabled (value & 0x10) isnt 0
        value

    readStatus: ->
        value = @$getStatus()
        @clearFrameIRQ()
        value

    getStatus: ->
        (@pulseChannel1.lengthCounter > 0)           |
        (@pulseChannel2.lengthCounter > 0)      << 1 |
        (@triangleChannel.lengthCounter > 0)    << 2 |
        (@noiseChannel.lengthCounter > 0)       << 3 |
        (@dmcChannel.sampleRemainingLength > 0) << 4 |
        @frameIrqActive                         << 6 |
        @dmcChannel.irqActive                   << 7

    ###########################################################
    # CPU/DMA lock status
    ###########################################################

    isBlockingCPU: ->
        @dmcChannel.memoryAccessCycles > 0

    isBlockingDMA: ->
        @dmcChannel.memoryAccessCycles > 2

    ###########################################################
    # APU tick
    ###########################################################

    tick: ->
        @$tickFrameCounter()
        @pulseChannel1.tick()
        @pulseChannel2.tick()
        @triangleChannel.tick()
        @noiseChannel.tick()
        @dmcChannel.tick()
        @$recordOutputValue() if @recordingActive

    tickFrameCounter: ->
        if @frameCounterResetDelay and --@frameCounterResetDelay is 0
            @frameCounter = @getFrameCounterMax()
        if --@frameCounter <= 0
            @tickFrameStep()

    tickFrameStep: ->
        @frameStep = (@frameStep + 1) % 6
        @frameCounter = @getFrameCounterMax()
        if @frameStep in [ 1, 2, 3, 5 ]
            @tickQuarterFrame()
        if @frameStep in [ 2, 5 ]
            @tickHalfFrame()
        if @frameStep in [ 4, 5, 0 ] and not (@frameIrqDisabled or @frameFiveStepMode)
            @activateFrameIRQ()

    tickQuarterFrame: ->
        @pulseChannel1.tickQuarterFrame()
        @pulseChannel2.tickQuarterFrame()
        @triangleChannel.tickQuarterFrame()
        @noiseChannel.tickQuarterFrame()

    tickHalfFrame: ->
        @pulseChannel1.tickHalfFrame()
        @pulseChannel2.tickHalfFrame()
        @triangleChannel.tickHalfFrame()
        @noiseChannel.tickHalfFrame()

    ###########################################################
    # Output composition
    ###########################################################

    getOutputValue: ->
        @getPulseOutputValue() + @getTriangleNoiseDMCOutput()

    getPulseOutputValue: ->
        pulse1Value = if @channelEnabled[0] then @pulseChannel1.getOutputValue() else 0
        pulse2value = if @channelEnabled[1] then @pulseChannel2.getOutputValue() else 0
        if pulse1Value or pulse2value
            95.88 / (8128 / (pulse1Value + pulse2value) + 100)
        else
            0

    getTriangleNoiseDMCOutput: ->
        triangleValue = if @channelEnabled[2] then @triangleChannel.getOutputValue() else 0
        noiseValue = if @channelEnabled[3] then @noiseChannel.getOutputValue() else 0
        dmcValue = if @channelEnabled[4] then @dmcChannel.getOutputValue() else 0
        if triangleValue or noiseValue or dmcValue
            159.79 / (1 / (triangleValue / 8227 + noiseValue / 12241 + dmcValue / 22638) + 100)
        else
            0

    ###########################################################
    # Audio samples recording
    ###########################################################

    initRecording: (bufferSize) ->
        @bufferSize = bufferSize                    # Output/record buffer size
        @lastPosition = bufferSize - 1              # Last position in the output/record buffer
        @recordBuffer = new Float32Array bufferSize # Audio samples which are curretly being recorded
        @recordPosition = -1                        # Buffer position with the last recorded sample
        @recordCycle = 0                            # CPU cycle counter
        @outputBuffer = new Float32Array bufferSize # Cached audio samples, ready for output to sound card
        @outputBufferFull = false                   # True when the output buffer is full

    startRecording: (sampleRate) ->
        throw "Cannot start audio recording without initialization" unless @recordBuffer
        @sampleRate = sampleRate  # How often are samples taken (samples per second)
        @sampleRateAdjustment = 0 # Sample rate adjustment per 1 output value (buffer underflow/overflow protection)
        @recordingActive = true

    stopRecording: ->
        @recordingActive = false

    recordOutputValue: ->
        position = ~~(@recordCycle++ * @sampleRate / @cpuFrequency)
        if position > @recordPosition
            @$fillRecordBuffer position

    fillRecordBuffer: (position) ->
        outputValue = @getOutputValue()
        if not position? or position > @lastPosition
            position = @lastPosition
        while @recordPosition < position
            @recordBuffer[++@recordPosition] = outputValue
            @sampleRate += @sampleRateAdjustment
        if @recordPosition >= @lastPosition and not @outputBufferFull
            @swapOutputBuffer()

    swapOutputBuffer: ->
        [ @recordBuffer, @outputBuffer ] = [ @outputBuffer, @recordBuffer ]
        @outputBufferFull = true
        @recordPosition = -1
        @recordCycle = 0

    readOutputBuffer: ->
        @fillRecordBuffer() unless @outputBufferFull # Buffer underflow
        @computeSampleRateAdjustment()
        @outputBufferFull = false
        @outputBuffer

    computeSampleRateAdjustment: ->
        # Our goal is to have right now about 50% of data in buffer
        percentageDifference = 0.5 - @recordPosition / @bufferSize       # Difference from expected value (50% of data in buffer)
        @sampleRateAdjustment = 100 * percentageDifference / @bufferSize # Adjustment per 1 output value in buffer

module.exports = APU
