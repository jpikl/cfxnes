###########################################################
# Local Storage
###########################################################

class LocalStorage

    save: (key, data) ->
        window.localStorage[key] = data

    load: (key) ->
        window.localStorage[key]

module.exports = LocalStorage
