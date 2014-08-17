logger = require("../utils/logger").get()

###########################################################
# Factory for mapper creation
###########################################################

class MapperFactory

    constructor: (@injector) ->
        @mappers = []
        @registerMapper 0x00, "NROM"
        @registerMapper 0x01, "MMC1"
        @registerMapper 0x02, "UNROM"
        @registerMapper 0x03, "CNROM"
        @registerMapper 0x04, "MMC3"
        @registerMapper 0x07, "AOROM"

    registerMapper: (id, name) ->
        @mappers[id] =
            name:  name
            class: require "../mappers/#{name.toLowerCase()}-mapper"

    createMapper: (cartridge) ->
        id = cartridge.mapperId
        mapper = @mappers[id]
        unless mapper?
            throw new Error "Unsupported mapper (id: #{id})."
        logger.info "Using '#{mapper.name}' mapper"
        @injector.injectInstance new mapper.class cartridge

module.exports = MapperFactory
