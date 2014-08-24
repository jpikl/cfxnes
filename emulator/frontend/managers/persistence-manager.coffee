logger = require("../../core/utils/logger").get()

###########################################################
# Persistence manager
###########################################################

class PersistenceManager

    @dependencies: [ "nes", "storage", "videoManager", "inputManager", "executionManager" ]

    init: (nes, storage, videoManager, inputManager, executionManager) ->
        @nes = nes
        @storage = storage
        @videoManager = videoManager
        @inputManager = inputManager
        @executionManager = executionManager

    ###########################################################
    # Cartridge data
    ###########################################################

    loadCartridgeData: ->
         if @nes.isCartridgeInserted()
            logger.info "Loading cartridge data"
            @nes.loadCartridgeData @storage

    saveCartridgeData: ->
        if @nes.isCartridgeInserted()
            logger.info "Saving cartridge data"
            @nes.saveCartridgeData @storage

    ###########################################################
    # Configuration
    ###########################################################

    loadConfiguration: ->
        config = @storage.read "config"
        if config
            logger.info "Loading configuration"
            @videoManager.readConfiguration config
            @inputManager.readConfiguration config
            @executionManager.readConfiguration config

    saveConfiguration: ->
        logger.info "Saving configuration"
        config = {}
        @videoManager.writeConfiguration config
        @inputManager.writeConfiguration config
        @executionManager.writeConfiguration config
        @storage.write "config", config

module.exports = PersistenceManager
