LoaderFactory     = require "./LoaderFactory"
ArrayBufferReader = require "./readers/ArrayBufferReader"
ServerFileReader  = require "./readers/ServerFileReader"

class Cartridge

    @loaderFactory = new LoaderFactory

    @fromArrayBuffer: (arrayBuffer) ->
        @fromReader new ArrayBufferReader arrayBuffer

    @fromServerFile: (filePath) ->
        @fromReader new ServerFileReader filePath    

    @fromReader: (reader) ->
        loader = @loaderFactory.createLoader reader
        loader.loadCartridge new Cartridge

module.exports = Cartridge
