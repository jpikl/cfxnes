class AbstractLoader

    @hasSignature (reader, bytes...) ->
        header = reader.read bytes.length
        for byte, i in bytes
            return false if byte != header[i]
        return true

    constructor: (@reader) ->
        @mapperFactory = require "./MapperFactory"
        
    reset: ->
        @reader.reset()

    readByte: ->
        (@readArray 1)[0]

    readArray: (size) ->
        result = @reader.read size
        if result?.length != size
            throw "Unexpected end of file."
        result

    checkSignature: (bytes...) ->
        if not Loader.hasSignature @reader, bytes...
            throw "Invalid file signature."

    createMapper: (id) ->
        @mapperFactory.createMapper id

modules.export = AbstractLoader
