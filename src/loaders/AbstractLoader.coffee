###########################################################
# Base class for all loaders
###########################################################

class AbstractLoader

    @containsSignature: (reader, signature) ->
        header = reader.read signature.length
        for signatureByte, i in signature
            return false if signatureByte != header[i]
        return true

    constructor: (@reader) ->

    ###########################################################
    # Cartridge creation functions
    ###########################################################

    loadCartridge: (cartridge) ->
        @cartridge = cartridge ? {}
        @reader.reset()
        @readCartridge()
        @cartridge

    ###########################################################
    # Helper functions
    ###########################################################

    readByte: ->
        (@readArray 1)[0]

    readArray: (size) ->
        result = @reader.read size
        if result?.length isnt size
            throw new Error "Unexpected end of file."
        result

    checkSignature: (bytes...) ->
        unless AbstractLoader.containsSignature @reader, bytes...
            throw new Error "Invalid file signature."

module.exports = AbstractLoader
