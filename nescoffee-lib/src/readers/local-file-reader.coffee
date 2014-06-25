AbstractReader = require "./abstract-reader"

fs = require "fs"

###########################################################
# Reader for local file
###########################################################

class LocalFileReader extends AbstractReader

    constructor: (@path) ->
        super()
        @data = fs.readFileSync @path

    getLength: ->
        @data.length

    getData: (start, end) ->
        @data[start...end]

module.exports = LocalFileReader
