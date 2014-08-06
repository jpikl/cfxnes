AbstractStorage = require "./abstract-storage"

###########################################################
# Local Storage
###########################################################

class LocalStorage extends AbstractStorage

    read: (key) ->
        window.localStorage?[@getFullKey key]

    write: (key, value) ->
        window.localStorage?[@getFullKey key] = value

    getFullKey: (key) ->
        "NESCoffee/#{key}"

module.exports = LocalStorage
