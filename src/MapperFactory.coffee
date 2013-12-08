class MapperFactory

    constructor: ->
        @mapperClasses = []
        @registerMapper 0x00, "NROMMapper"

    registerMapper: (id, name) ->
        @mapperClasses[id] = require "./mappers/#{name}"

    createMapper: (id) ->
        mapperClass = @mapperClasses[id]
        if not mapperClass?
            throw "Unsupported mapper (id: #{id})."
        return new mapperClass

module.exports = new MapperFactory
