AbstractReader = require "./AbstractReader"

###########################################################
# Reader for array buffer
###########################################################

class ArrayBufferReader extends AbstractReader

    constructor: (buffer) ->
        super()
        @view = new Uint8Array buffer

    getLength: ->
        @view.length

    getData: (start, end) ->
        @view.subarray start, end

module.exports = ArrayBufferReader
