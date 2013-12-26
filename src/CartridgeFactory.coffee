ArrayBufferReader = require "./readers/ArrayBufferReader"
LocalFileReader   = require "./readers/LocalFileReader"

###########################################################
# Factory for cartridges
###########################################################

class CartridgeFactory

    @inject: [ "loaderFactory" ]
    
    fromArrayBuffer: (arrayBuffer) ->
        @fromReader new ArrayBufferReader arrayBuffer

    fromLocalFile: (filePath) ->
        @fromReader new LocalFileReader filePath    

    fromReader: (reader) ->
        loader = @loaderFactory.createLoader reader
        loader.loadCartridge()

module.exports = CartridgeFactory
