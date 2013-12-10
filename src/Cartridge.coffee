LoaderFactory     = require "./LoaderFactory"
ArrayBufferReader = require "./readers/ArrayBufferReader"
ServerFileReader  = require "./readers/ServerFileReader"

class Cartridge

    @fromArrayBuffer: (arrayBuffer) ->
        @fromReader new ArrayBufferReader arrayBuffer

    @fromServerFile: (filePath) ->
        @fromReader new ServerFileReader filePath    

    @fromReader: (reader) ->
        loader = LoaderFactory.createLoader reader
        loader.createCartridge()

module.exports = Cartridge
