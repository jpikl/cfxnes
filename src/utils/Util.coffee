Util =

    ###########################################################
    # Bit utitlities
    ###########################################################

    generateBits: (from, to) ->
        (1 << bit) for bit in [from..to]

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

module.exports = Util
