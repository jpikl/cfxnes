class MapperFactory

    constructor: ->
        @mapperClasses = []
        @registerMapper 0x00, "NROMMapper"

    registerMapper: (id, name) ->
        @mapperClasses[id] = require "./mappers/#{name}"

    createMapper: (cartridge) ->
        mapperId = cartridge.mapperId
        mapperClass = @mapperClasses[mapperId]
        if mapperClass is null
            throw "Unsupported mapper (id: #{mapperId})."
        return new mapperClass cartridge

module.exports = MapperFactory
