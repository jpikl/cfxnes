logger = require("../utils/logger").get()

###########################################################
# Audio processing unit
###########################################################

class APU

    ###########################################################
    # Power-up state initialization
    ###########################################################

    powerUp: ->
        logger.info "Reseting APU"
        @resetRegisters()

    resetRegisters: ->
        # TODO

    ###########################################################
    # Audio recording
    ###########################################################

    startRecording: (buffer, cyclesPerSample) ->
        @outputBuffer = buffer
        @outputPosition = 0
        @cyclesPerSample = cyclesPerSample
        @cyclesLeft = 0

    stopRecording: ->
        @outputBuffer = null

    getRecordedSize: ->
        @outputPosition

    canRecordValue: ->
        @outputBuffer? and @outputPosition < @outputBuffer.length

    ###########################################################
    # Audio generation
    ###########################################################

    tick: ->
        if @$canRecordValue() and @cyclesLeft-- is 0
            @outputBuffer[@outputPosition++] = @getOutputValue()
            @cyclesLeft = @cyclesPerSample

    getOutputValue: ->
        Math.sin(@t += 0.02) # Just for testing purposes

    t: 0

module.exports = APU
