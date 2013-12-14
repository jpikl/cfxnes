class AbstractReader

    constructor: ->
        @reset()

    reset: ->
        @position = 0

    read: (size) ->
        @getData @position, @movePosition size

    movePosition: (size) ->
        size ?= @getLength()
        position = Math.min @position + size, @getLength()

module.exports = AbstractReader
