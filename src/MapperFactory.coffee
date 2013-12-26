###########################################################
# Factory for mappers
###########################################################

class MapperFactory

    constructor: ->
        @mapperClasses = []
        @registerMapper 0x00, "NROMMapper"

    registerMapper: (id, name) ->
        @mapperClasses[id] = require "./mappers/#{name}"

    createMapper: (cartridge) ->
        mapperId = cartridge.mapperId
        mapperClass = @mapperClasses[mapperId]
        throw "Unsupported mapper (id: #{mapperId})." unless mapperClass?
        return new mapperClass cartridge

module.exports = MapperFactory
