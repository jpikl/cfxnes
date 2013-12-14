Cartridge = require "../Cartridge"

class AbstractLoader

    @containsSignature: (reader, bytes) ->
        header = reader.read bytes.length
        for byte, i in bytes
            return false if byte != header[i]
        return true

    constructor: (@reader) ->

    loadCartridge: (cartridge) ->
        @cartridge = cartridge ? {}
        @reader.reset()
        @readCartridge()
        @cartridge

    readByte: ->
        (@readArray 1)[0]

    readArray: (size) ->
        result = @reader.read size
        if result?.length != size
            throw "Unexpected end of file."
        result

    checkSignature: (bytes...) ->
        if not AbstractLoader.containsSignature @reader, bytes...
            throw "Invalid file signature."

    isBitSet: (value, bit) ->
        (value & (1 << bit)) != 0

module.exports = AbstractLoader
