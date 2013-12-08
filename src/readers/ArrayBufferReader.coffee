class ArrayBufferReader

    constructor: (buffer) ->
        @view = new Unit8Array buffer
        @reset()

    reset: ->
        @position = 0

    read: (size) ->
        size ?= @view.length
        end = Math.min @position + size, @view.length
        result = @view.subarray @position, end
        @position = end
        result

    close: ->
        @view = null

module.exports = ArrayBufferReader
