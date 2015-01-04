PulseChannel    = require "../channels/pulse-channel"
TriangleChannel = require "../channels/triangle-channel"
NoiseChannel = require "../channels/noise-channel"
DMCChannel = require "../channels/dmc-channel"

logger = require("../utils/logger").get()

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
        @frameIrqActive = false # Frame IRQ flag
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

    ###########################################################
    # Frame counter register
    ###########################################################

    writeFrameCounter: (value) ->
        @frameFiveStepMode = (value & 0x80) isnt 0
        @frameIrqEnabled = (value & 0x40) is 0
        @frameIrqActive and= @frameIrqActive # Disabling IRQ clears IRQ flag
        @frameStep = 0
        @frameCounter = @getFrameCounterMax()
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
        @frameIrqActive = false
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
    # APU tick
    ###########################################################

    tick: ->
        @$tickFrameCounter()
        @pulseChannel1.tick()
        @pulseChannel2.tick()
        @triangleChannel.tick()
        @noiseChannel.tick()
        @dmcChannel.tick()
        @$recordOutputValue()

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
        if @frameStep in [ 4, 5, 0 ] and @frameIrqEnabled and not @frameFiveStepMode
            @frameIrqActive = true
        if @frameStep is 0 and @frameIrqActive
            @cpu.sendIRQ()

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
        @recordingBuffer = new Float32Array bufferSize # Audio samples which are curreltly being recorded
        @recordingPosition = 0
        @recordingCycle = 0
        @outputBuffer = new Float32Array bufferSize    # Cached audio samples, ready for output to sound card
        @outputBufferAvailable = false
        @sampleRate = sampleRate

    startRecording: ->
        throw "Cannot start audio recording without initialization" unless @recordingBuffer
        @recordingActive = true

    stopRecording: ->
        @recordingActive = false

    recordOutputValue: ->
        if @recordingActive
            newRecordingPosition = ~~(@recordingCycle++ * @sampleRate / @cpuFrequency)
            if newRecordingPosition > @recordingPosition
                @recordingPosition = newRecordingPosition
                @recordingBuffer[@recordingPosition] = @getOutputValue()
                if @recordingPosition >= @recordingBuffer.length - 1
                    @swapOutputBuffer()
                    @recordingPosition = 0
                    @recordingCycle = 0
        # TODO handle buffer overflow by adjusting sampleRate

    readOutputBuffer: ->
        @completeOutputBuffer() unless @outputBufferAvailable # Buffer overflow
        @outputBufferAvailable = false
        @outputBuffer

    completeOutputBuffer: ->
        while @recordingPosition < @recordingBuffer.length
            @recordingBuffer[@recordingPosition++] = 0
        @swapOutputBuffer()

    swapOutputBuffer: ->
        [ @recordingBuffer, @outputBuffer ] = [ @outputBuffer, @recordingBuffer ]
        @outputBufferAvailable = true

module.exports = APU
