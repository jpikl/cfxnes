###########################################################
# Base implementation for all loaders
###########################################################

class AbstractLoader

    @containsSignature: (reader, bytes) ->
        header = reader.read bytes.length
        for byte, i in bytes
            return false if byte != header[i]
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
            @cartridge.sramBanks = (@createEmptySRAMBank() for [1..@cartridge.sramBanksCount])

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
