AbstractReader = require "./AbstractReader"

class ArrayBufferReader extends AbstractReader

    constructor: (buffer) ->
        super()
        @view = new Unit8Array buffer

    getLength: ->
        @view.length

    getData: (start, end) ->
        @view.subarray start, end

module.exports = ArrayBufferReader
