util = require "util"

Util =

    ###########################################################
    # Bit contants and operations
    ###########################################################

    Bit0: 1 << 0
    Bit1: 1 << 1
    Bit2: 1 << 2
    Bit3: 1 << 3
    Bit4: 1 << 4
    Bit5: 1 << 5
    Bit6: 1 << 6
    Bit7: 1 << 7

    isBitSet: (value, bit) -> 
        (value & (1 << bit)) != 0

    ###########################################################
    # Formatting utilities
    ###########################################################

    byteAsHex: (byte) ->
        hex = (byte.toString 16).toUpperCase()
        if hex.length == 1 then "0" + hex else hex

    wordAsHex: (word, putSpace) ->
        hex1 = Util.byteAsHex word & 0xFF
        hex2 = Util.byteAsHex word >>> 8
        hex2 + hex1

    fillLeft: (value, width, character = " ") ->
        result = (Array(width + 1).join character) + value
        result[result.length - width ...]

    fillRight: (value, width, character = " ") ->
        result = value + (Array(size + 1).join " ")
        result[...size]

    ###########################################################
    # Printing
    ###########################################################

    print: util.print
    
    println: util.puts

module.exports = Util
