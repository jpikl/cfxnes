logger = require("../../core/utils/logger").get()

###########################################################
# Cartridge manager
###########################################################

class CartridgeManager

    @dependencies: [ "nes", "cartridgeFactory", "executionManager", "persistenceManager" ]

    init: (nes, cartridgeFactory, executionManager, persistenceManager) ->
        @nes = nes
        @cartridgeFactory = cartridgeFactory
        @executionManager = executionManager
        @persistenceManager = persistenceManager

    ###########################################################
    # Cartridge loading
    ###########################################################

    loadCartridge: (file, onLoad, onError) ->
        logger.info "Loding cartridge from file"
        self = @
        reader = new FileReader
        reader.onload = (event) ->
            data = event.target.result
            error = self.tryInsertCartridge data
            if error
                onError?.call self, error
            else
                onLoad?.call self
        reader.onerror = (event) ->
            onError?.call self, event.target.error
        reader.readAsArrayBuffer file

    downloadCartridge: (url, onLoad, onError) ->
        logger.info "Downloading cartridge from '#{url}'"
        self = @
        request = new XMLHttpRequest
        request.open "GET", url, true
        request.responseType = "arraybuffer"
        request.onload = ->
            if @status is 200
                error = self.tryInsertCartridge @response
            else
                error = "Unable to download file '#{url}' (status code: #{@status})."
            if error
                onError?.call self, error
            else
                onLoad?.call self
        request.onerror = (error) ->
            onError?.call self, error
        request.send()

    ###########################################################
    # Cartridge processing
    ###########################################################

    tryInsertCartridge: (arrayBuffer) ->
        try
            @insertCartridge arrayBuffer
            undefined
        catch error
            logger.error error
            error.message or "Internal error"

    insertCartridge: (arrayBuffer) ->
        logger.info "Inserting cartridge"
        cartridge = @cartridgeFactory.fromArrayBuffer arrayBuffer
        @persistenceManager.saveCartridgeData()
        @nes.insertCartridge cartridge
        @nes.pressPower()
        @persistenceManager.loadCartridgeData()
        @executionManager.restart() if @executionManager.isRunning()

    isCartridgeInserted: ->
        @nes.isCartridgeInserted()

    removeCartridge: ->
        @nes.removeCartridge()

module.exports = CartridgeManager
