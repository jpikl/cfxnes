Logger = require "../utils/Logger"

logger = Logger.get()

###########################################################
# Factory for loader creation
###########################################################

class LoaderFactory

    constructor: ->
        @loaders = []
        @registerLoader "NES2" # Must be checked before INES
        @registerLoader "INES"

    registerLoader: (name) ->
        @loaders.push
            name:  name
            class: require "./loaders/#{name}Loader"

    createLoader: (reader) ->
        for loader in @loaders
            reader.reset()
            if loader.class.supportsInput reader
                logger.info "Using '#{loader.name}' loader"
                return new loader.class reader
        throw new Error "Unsupported cartridge ROM format."

module.exports = LoaderFactory
