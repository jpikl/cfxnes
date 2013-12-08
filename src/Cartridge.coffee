class Cartridge

    constructor: (reader) ->
        loaderFactory = require "./LoaderFactory"
        loader = loaderFactory.createLoader reader
        loader.load this

    read: (address) ->
        @mapper.read this, address

    write: (address, value) ->
        @mapper.write this, address, value

    saveRAM: ->
