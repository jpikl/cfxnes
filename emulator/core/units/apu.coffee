Interrupt       = require("../common/types").Interrupt
PulseChannel    = require "../channels/pulse-channel"
TriangleChannel = require "../channels/triangle-channel"
NoiseChannel    = require "../channels/noise-channel"
DMCChannel      = require "../channels/dmc-channel"
logger          = require("../utils/logger").get()

FRAME_COUNTER_MAX = 14915

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
        @stopRecording()

    ###########################################################
    # Power-up state initialization
    ###########################################################

    powerUp: ->
        logger.info "Reseting APU"
        @setNTSCMode true
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
        @cpuFrequency = if ntscMode then 1789773 else 1662607
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
        @frameCounter = @getFrameCounterMax()      # Counter should be actualy reseted after 3 or 4 CPU cycle (delay not emulated yet)
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
        pulse1Value = @pulseChannel1.getOutputValue()
        pulse2value = @pulseChannel2.getOutputValue()
        if pulse1Value or pulse2value
            95.88 / (8128 / (pulse1Value + pulse2value) + 100)
        else
            0

    getTriangleNoiseDMCOutput: ->
        triangleValue = @triangleChannel.getOutputValue()
        noiseValue = @noiseChannel.getOutputValue()
        dmcValue = @dmcChannel.getOutputValue()
        if triangleValue or noiseValue or dmcValue
            159.79 / (1 / (triangleValue / 8227 + noiseValue / 12241 + dmcValue / 22638) + 100)
        else
            0

    ###########################################################
    # Audio samples recording
    ###########################################################

    initRecording: (bufferSize, sampleRate) ->
        @recordBuffer = new Float32Array bufferSize # Audio samples which are curretly being recorded
        @recordPosition = -1                        # Buffer position with the last recorded sample
        @recordCycle = 0                            # CPU cycle counter
        @outputBuffer = new Float32Array bufferSize # Cached audio samples, ready for output to sound card
        @outputBufferFull = false                   # True when output buffer is full and ready
        @sampleRate = sampleRate                    # How often are samples taken (samples per second)
        @bufferUnderflowLimit = bufferSize  / 3     # When we need to increase sample rate (buffer underflow protection)
        @bufferOverflowLimit = bufferSize * 2 / 3   # When we need to decrease sample rate (buffer overflow protection)

    startRecording: ->
        throw "Cannot start audio recording without initialization" unless @recordBuffer
        @recordingActive = true

    stopRecording: ->
        @recordingActive = false

    recordOutputValue: ->
        newRecordPosition = ~~(@recordCycle++ * @sampleRate / @cpuFrequency)
        if newRecordPosition > @recordPosition
            @recordPosition = newRecordPosition
            @recordBuffer[@recordPosition] = @getOutputValue()
            if @outputBufferFull and @recordPosition > @bufferOverflowLimit
                @sampleRate -= 0.1 if @sampleRate > 1             # buffer overflow protection
            else if not @outputBufferFull or @recordPosition < @bufferUnderflowLimit
                @sampleRate += 0.1 if @sampleRate < @cpuFrequency # buffer underflow protection
            if @recordPosition >= @recordBuffer.length - 1 and not @outputBufferFull
                @swapOutputBuffer()
                @recordPosition = -1
                @recordCycle = 0

    readOutputBuffer: ->
        @completeOutputBuffer() unless @outputBufferFull # Buffer overflow
        @outputBufferFull = false
        @outputBuffer

    completeOutputBuffer: ->
        while @recordPosition < @recordBuffer.length
            @recordBuffer[@recordPosition++] = 0
        @swapOutputBuffer()

    swapOutputBuffer: ->
        [ @recordBuffer, @outputBuffer ] = [ @outputBuffer, @recordBuffer ]
        @outputBufferFull = true

module.exports = APU
