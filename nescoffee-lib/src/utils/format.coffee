###########################################################
# Formating utilities
###########################################################

Format =

    byteAsHex: (value) ->
        hex = (value.toString 16).toUpperCase()
        if hex.length == 1 then "0" + hex else hex

    wordAsHex: (value, putSpace) ->
        hex1 = Format.byteAsHex value & 0xFF
        hex2 = Format.byteAsHex value >>> 8
        hex2 + hex1

    fillLeft: (value, width, character = " ") ->
        result = (Array(width + 1).join character) + value
        result[result.length - width ...]

    fillRight: (value, width, character = " ") ->
        result = value + (Array(width + 1).join " ")
        result[...width]

    capitalize: (value) ->
        words = value.split(' ')
        words = words.map (word) -> word[0].toUpperCase() + word[1..-1].toLowerCase()
        words.join ' '

    readableSize: (size) ->
        return "???" if typeof size isnt "number"
        return "#{size / (1024 * 1024)} MB" if size >= 1024 * 1024
        return "#{size / 1024} KB" if size >= 1024
        return "#{size} B"

    readableBytes: (bytes) ->
        return "???" if not bytes
        String.fromCharCode.apply null, bytes

module.exports = Format
