ArrayBufferReader = require "./readers/ArrayBufferReader"
LocalFileReader   = require "./readers/LocalFileReader"

class CartridgeFactory

    constructor: (@loaderFactory) ->
    
    fromArrayBuffer: (arrayBuffer) ->
        @fromReader new ArrayBufferReader arrayBuffer

    fromLocalFile: (filePath) ->
        @fromReader new LocalFileReader filePath    

    fromReader: (reader) ->
        loader = @loaderFactory.createLoader reader
        loader.loadCartridge()

module.exports = CartridgeFactory
