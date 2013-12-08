fs = require "fs"

class ServerFileReader

    constructor: (@path) ->  
        @reset()

    reset: ->
        @stream = fs.createReadStream @path

    read: (size) ->
        @stream.read size

    close: ->
        @stream = null
        
module.exports = ServerFileReader
