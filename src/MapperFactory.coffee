Logger = require "../utils/Logger"

logger = Logger.get()

###########################################################
# Factory for mapper creation
###########################################################

class MapperFactory

    constructor: ->
        @mappers = []
        @registerMapper 0x00, "NROM"
        @registerMapper 0x01, "MMC1"
        @registerMapper 0x02, "UNROM"
        @registerMapper 0x03, "CNROM"

    registerMapper: (id, name) ->
        @mappers[id] =
            name:  name
            class: require "./mappers/#{name}Mapper"

    createMapper: (cartridge) ->
        id = cartridge.mapperId
        mapper = @mappers[id]
        unless mapper?
            throw new Error "Unsupported mapper (id: #{id})."
        logger.info "Using '#{mapper.name}' mapper"
        new mapper.class cartridge

module.exports = MapperFactory
