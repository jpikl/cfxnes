###########################################################
# Local Storage
###########################################################

ROOT_KEY = "NESCoffee"

class LocalStorage

    save: (key, data) ->
        window.localStorage["#{ROOT_KEY}/#{key}"] = data

    load: (key) ->
        window.localStorage["#{ROOT_KEY}/#{key}"]

module.exports = LocalStorage
