###########################################################
# Factory for mapper creation
###########################################################

class MapperFactory

    constructor: ->
        @mapperClasses = []
        @registerMapper 0x00, "NROMMapper"
        @registerMapper 0x01, "MMC1Mapper"
        @registerMapper 0x02, "UNROMMapper"
        @registerMapper 0x03, "CNROMMapper"

    registerMapper: (id, name) ->
        @mapperClasses[id] = require "./mappers/#{name}"

    createMapper: (cartridge) ->
        mapperId = cartridge.mapperId
        mapperClass = @mapperClasses[mapperId]
        unless mapperClass?
            throw new Error "Unsupported mapper (id: #{mapperId})."
        return new mapperClass cartridge

module.exports = MapperFactory
