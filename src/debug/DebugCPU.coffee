Util = require "util"
CPU  = require "../CPU"

class DebugCPU extends CPU

    constructor: (cpuMemory, ppu, papu) ->
        super(cpuMemory, ppu, papu)

    ###########################################################
    # Program execution
    ###########################################################

    readOperation: ->
        @instructionAddress = @programCounter
        @instructionByte1 = @cpuMemory.read @programCounter
        @instructionByte2 = @cpuMemory.read (@programCounter + 1) & 0xFFFF
        @instructionByte3 = @cpuMemory.read (@programCounter + 2) & 0xFFFF
        super()

    ###########################################################
    # Basic addressing modes
    ###########################################################

    impliedMode: =>
        @logOperation 1
        super()

    accumulatorMode: =>
        @logOperation 1
        super()

    immediateMode: =>
        @logOperation 2
        super()

    ###########################################################
    # Zero page addressing modes
    ###########################################################

    zeroPageMode: =>
        @logOperation 2
        super()

    zeroPageXMode: =>
        @logOperation 2
        super()

    zeroPageYMode: =>
        @logOperation 2
        super()

    ###########################################################
    # Absolute addressing modes
    ###########################################################

    absoluteMode: =>
        @logOperation 3
        super()

    absoluteXMode: =>
        @logOperation 3
        super()

    absoluteYMode: =>
        @logOperation 3
        super()

    ###########################################################
    # Relative addressing mode
    ###########################################################

    relativeMode: =>
        @logOperation 2
        super()

    ###########################################################
    # Indirect addressing modes
    ###########################################################

    indirectMode: =>
        @logOperation 3
        super()

    indirectXMode: =>
        @logOperation 2
        super()

    indirectYMode: =>
        @logOperation 2
        super()

    ###########################################################
    # Logging utilities
    ###########################################################

    logOperation: (instructionSize) ->
        address = @wordAsHex @instructionAddress
        byte1 = @byteAsHex @instructionByte1
        byte2 = if instructionSize > 1 then @byteAsHex @instructionByte2 else "  "
        byte3 = if instructionSize > 2 then @byteAsHex @instructionByte3 else "  "
        Util.print "#{address}  #{byte1} #{byte2} #{byte2}  \n"

    byteAsHex: (byte) ->
        hex = (byte.toString 16).toUpperCase()
        if hex.length == 1 then "0" + hex else hex

    wordAsHex: (word, putSpace) ->
        hex1 = @byteAsHex word & 0xFF
        hex2 = @byteAsHex word >> 8
        hex2 + hex1

module.exports = DebugCPU
