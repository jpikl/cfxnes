logger = require("../utils/logger").get()

###########################################################
# Factory for mapper creation
###########################################################

class MapperFactory

    constructor: (@injector) ->
        @mappers = []
        @registerMapper 0x00, "NROM",  require "../mappers/nrom-mapper"
        @registerMapper 0x01, "MMC1",  require "../mappers/mmc1-mapper"
        @registerMapper 0x02, "UNROM", require "../mappers/unrom-mapper"
        @registerMapper 0x03, "CNROM", require "../mappers/cnrom-mapper"
        @registerMapper 0x04, "MMC3",  require "../mappers/mmc3-mapper"
        @registerMapper 0x07, "AOROM", require "../mappers/aorom-mapper"

    registerMapper: (id, name, clazz) ->
        @mappers[id] =
            name:  name
            clazz: clazz

    createMapper: (cartridge) ->
        id = cartridge.mapperId
        mapper = @mappers[id]
        unless mapper?
            throw new Error "Unsupported mapper (ID: #{id})."
        logger.info "Using '#{mapper.name}' mapper"
        @injector.injectInstance new mapper.clazz cartridge

module.exports = MapperFactory
