logger = require("../utils/logger").get()

###########################################################
# Factory for loader creation
###########################################################

class LoaderFactory

    constructor: ->
        @loaders = []
        @registerLoader "NES2", require "../loaders/nes2-loader" # Must be processed before INES
        @registerLoader "INES", require "../loaders/ines-loader"

    registerLoader: (name, clazz) ->
        @loaders.push
            name:  name
            clazz: clazz

    createLoader: (reader) ->
        for loader in @loaders
            reader.reset()
            if loader.clazz.supportsInput reader
                logger.info "Using '#{loader.name}' loader"
                return new loader.clazz reader
        throw new Error "Unsupported data format."

module.exports = LoaderFactory
