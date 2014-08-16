AbstractStorage = require "./abstract-storage"

###########################################################
# Local Storage
###########################################################

class MemoryStorage extends AbstractStorage

    constructor: ->
        @data = {}

    read: (key) ->
        data[key]

    write: (key, value) ->
        data[key] = value

module.exports = MemoryStorage
