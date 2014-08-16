logger = require("../utils/logger").get()

###########################################################
# Factory for loader creation
###########################################################

class LoaderFactory

    constructor: ->
        @loaders = []
        @registerLoader "NES2" # Must be processed before INES
        @registerLoader "INES"

    registerLoader: (name) ->
        @loaders.push
            name:  name
            class: require "../loaders/#{name.toLowerCase()}-loader"

    createLoader: (reader) ->
        for loader in @loaders
            reader.reset()
            if loader.class.supportsInput reader
                logger.info "Using '#{loader.name}' loader"
                return new loader.class reader
        throw new Error "Unsupported cartridge ROM format."

module.exports = LoaderFactory
