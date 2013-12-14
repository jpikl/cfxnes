FileSystem     = require "fs"
AbstractReader = require "./AbstractReader"

class ServerFileReader extends AbstractReader

    constructor: (@path) ->  
        super()
        @data = FileSystem.readFileSync @path

    getLength: ->
        @data.length

    getData: (start, end) ->
        @data[index] for index in [start...end]
        
module.exports = ServerFileReader
