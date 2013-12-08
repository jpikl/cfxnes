class LoaderFactory

    constructor: ->
        @loaderClasses = []
        @registerLoader "INESLoader"

    registerLoader: (name) ->
        @loaderClasses.push require "./loaders/#{name}"

    createLoader: (reader) ->
        try
            for loaderClass in loaderClasses
                reader.reset()
                if loaderClass.supports reader
                    return new loaderClass reader
            throw "Unsupported cartridge ROM format."
        finally
            reader.close()

module.exports = new LoaderFactory
