###########################################################
# Factory for cartridges
###########################################################

class CartridgeFactory

    @inject: [ "loaderFactory" ]

    fromArrayBuffer: (arrayBuffer) ->
        ArrayBufferReader = require "./readers/ArrayBufferReader"
        @fromReader new ArrayBufferReader arrayBuffer

    fromLocalFile: (filePath) ->
        LocalFileReader   = require "./readers/LocalFileReader"
        @fromReader new LocalFileReader filePath    

    fromReader: (reader) ->
        loader = @loaderFactory.createLoader reader
        loader.loadCartridge()

module.exports = CartridgeFactory
