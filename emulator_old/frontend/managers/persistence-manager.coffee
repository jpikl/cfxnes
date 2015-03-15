logger = require("../../core/utils/logger").get()

DEFAULT_SAVE_PERIOD = 60000 # 1 minute

###########################################################
# Persistence manager
###########################################################

class PersistenceManager

    @dependencies: [ "nes", "storage", "videoManager", "audioManager", "inputManager", "executionManager" ]

    init: (nes, storage, videoManager, audioManager, inputManager, executionManager) ->
        @nes = nes
        @storage = storage
        @videoManager = videoManager
        @audioManager = audioManager
        @inputManager = inputManager
        @executionManager = executionManager
        @initListeners()
        @setDefaults()

    initListeners: ->
        window.addEventListener "beforeunload", @saveAll

    setDefaults: ->
        logger.info "Using default persistence configuration"
        @enablePeriodicSave DEFAULT_SAVE_PERIOD

    ###########################################################
    # Periodical save
    ###########################################################

    enablePeriodicSave: (period = DEFAULT_SAVE_PERIOD) ->
        @disablePeriodicSave()
        logger.info "Enabling periodic save with period #{period} ms"
        @periodicSaveId = setInterval @saveAll, period

    disablePeriodicSave: ->
        if @isPeriodicSave()
            logger.info "Disabling periodic save"
            clearInterval @periodicSaveId

    isPeriodicSave: ->
        @periodicSaveId?

    saveAll: =>
        @saveCartridgeData()
        @saveConfiguration()
        undefined # Otherwise IE will show the return value in message dialog

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
        config = @storage.readObject "config"
        if config
            logger.info "Loading configuration"
            @videoManager.readConfiguration config
            @audioManager.readConfiguration config
            @inputManager.readConfiguration config
            @executionManager.readConfiguration config

    saveConfiguration: ->
        logger.info "Saving configuration"
        config = {}
        @videoManager.writeConfiguration config
        @audioManager.writeConfiguration config
        @inputManager.writeConfiguration config
        @executionManager.writeConfiguration config
        @storage.writeObject "config", config

module.exports = PersistenceManager
