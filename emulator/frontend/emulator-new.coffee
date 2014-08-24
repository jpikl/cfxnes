###########################################################
# Emulator API
###########################################################

class Emulator

    @dependencies: [ "executionManager", "cartridgeManager", "videoManager", "inputManager", "persistenceManager" ]

    constructor: (mode = "base") ->
        logger.info "Creating '#{mode}' dependency injection context"
        injector = new Injector "frontend/config/#{mode}-config"
        injector.injectInstance this

    init: (executionManager, cartridgeManager, videoManager, inputManager, persistenceManager) ->
        @executionManager = executionManager
        @cartridgeManager = cartridgeManager
        @videoManager = videoManager
        @inputManager = inputManager
        @persistenceManager = persistenceManager
        @persistenceManager.loadConfiguration()

    ###########################################################
    # Generic API
    ###########################################################

    "setDefaults": ->
        @executionManager.setDefaults()
        @videoManager.setDefaults()
        @inputManager.setDefaults()
        @persistenceManager.setDefaults()

    ###########################################################
    # Execution API
    ###########################################################

    "start": ->
        @executionManager.start()

    "stop": ->
        @executionManager.stop()

    "restart": ->
        @executionManager.restart()

    "isRunning": ->
        @executionManager.isRunning()

    "hardReset": ->
        @executionManager.hardReset()

    "softReset": ->
        @executionManager.softReset()

    "getFPS": ->
        @executionManager.getFPS()

    "setTVSystem": (tvSystem) ->
        @executionManager.setTVSystem tvSystem

    "getTVSystem": ->
        @executionManager.getTVSystem()

    ###########################################################
    # Cartridges API
    ###########################################################

    "loadCartridge": (file, onLoad, onError) ->
        @cartridgeManager.loadCartridge file, onLoad, onError

    "downloadCartridge": (url, onLoad, onError) ->
        @cartridgeManager.downloadCartridge url, onLoad, onError

    "insertCartridge": (arrayBuffer) ->
        @cartridgeManager.insertCartridge arrayBuffer

    "isCartridgeInserted": ->
        @cartridgeManager.isCartridgeInserted()

    ###########################################################
    # Video API
    ###########################################################

    "setVideoOutput": (canvas) ->
        @videoModule.setCanvas canvas

    "setVideoPalette": (palette) ->
        @videoModule.setPalette palette

    "getVideoPalette": ->
        @videoModule.getPalette()

    "setVideoScale": (scale) ->
        @videoModule.setScale scale

    "getVideoScale": (scale) ->
        @videoModule.getScale()

    "getMaxVideoScale": ->
        @videoModule.getMaxScale()

    "decreaseVideoScale": ->
        scale = @videoModule.getScale() - 1
        @videoModule.setScale scale if scale >= 1

    "increaseVideoScale": ->
        scale = @videoModule.getScale() + 1
        @videoModule.setScale scale if scale <= @videoModule.getMaxScale()

    "setVideoSmoothing" (smoothing) ->
        @videoManager.setSmoothing smoothing

    "isVideoSmoothing": ->
        @videoManager.isSmoothing()

    "setVideoDebugging": (debugging) ->
        @videoManager.setDebugging debugging

    "isVideoDebugging": ->
        @videoManager.isDebugging()

    "enterFullScreen": ->
        @videoManager.enterFullScreen()

    ###########################################################
    # Inputs API
    ###########################################################

    "setInputDevice": (port, id) ->
        @inputManager.connectTarget port, id

    "getInputDevice": (port) ->
        @inputManager.getConnectedTarget port

    "mapInput": (targetPort, targetId, targetInput, sourceId, sourceInput) ->
        @inputManager.mapInput targetPort, targetId, targetInput, sourceId, sourceInput

    "unmapInput": (targetPort, targetId, targetInput, sourceId, sourceInput) ->
        @inputManager.unmapInput targetPort, targetId, targetInput, sourceId, sourceInput

    "getMappedInputName": (targetPort, targetId, targetInput) ->
        @inputManager.getMappedInputName targetPort, targetId, targetInput

    "recordInput": (targetPort, targetId, targetInput) ->
        @inputManager.recordInput targetPort, targetId, targetInput

    "setDefaultInputsMapping": ->
        @inputManager.setDefaults()

    ###########################################################
    # Persistence API
    ###########################################################

    "enablePeriodicSave": (period) ->
        @persistenceManager.enablePeriodicSave period

    "disablePeriodicSave": ->
        @persistenceManager.disablePeriodicSave()

    "isPeriodicSave": ->
        @persistenceManager.isPeriodicSave()

modules.exports = window["NESCoffee"] = Emulator
