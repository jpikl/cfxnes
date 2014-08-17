logger = require("../../core/utils/logger").get()

###########################################################
# Configuration manager
###########################################################

class ConfigManager

    @dependencies: [ "storage", "videoManager", "inputManager" ]

    init: (storage, videoManager, inputManager) ->
        @storage = storage
        @videoManager = videoManager
        @inputManager = inputManager

    loadConfig: ->
        logger.info "Loading configuration"
        config = @storage.read "config"
        if config
            @videoManager.readConfig config
            @inputManager.readConfig config

    saveConfig: ->
        logger.info "Saving configuration"
        config = {}
        @videoManager.writeConfig config
        @inputManager.writeConfig config
        @storage.write "config", config

module.exports = ConfigManager
