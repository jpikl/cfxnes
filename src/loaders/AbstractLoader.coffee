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
        @initCartridge()
        @cartridge

    initCartridge: ->
        @initSRAM()

    initSRAM: ->
        if @cartridge.hasSRAM
            @cartridge.sramBanks = (@createEmptySRAMBank() for [0...@cartridge.sramBanksCount])

    createEmptySRAMBank: ->
        0 for [0...0x2000]

    ###########################################################
    # Helper functions
    ###########################################################

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

module.exports = AbstractLoader
