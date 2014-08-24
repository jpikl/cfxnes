logger = require("../../core/utils/logger").get()

###########################################################
# Cartridge manager
###########################################################

class CartridgeManager

    @dependencies: [ "nes", "storage", "cartridgeFactory", "executionManager" ]

    init: (nes, storage, cartridgeFactory, executionManager) ->
        @nes = nes
        @storage = storage
        @cartridgeFactory = cartridgeFactory
        @executionManager = executionManager

    ###########################################################
    # Cartridge loading
    ###########################################################

    loadCartridge: (file, onLoad, onError) ->
        logger.info "Loding cartridge from file"
        self = @
        reader = new FileReader
        reader.onload = (event) ->
            data = event.target.result
            error = self.insertCartridge data
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
                error = self.insertCartridge @response
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

    insertCartridge: (arrayBuffer) ->
        @saveCartridgeData()
        @doInsertCartridge()
        @loadCartridgeData()
        @executionManager.restart() if @executionManager.isRunning()

    doInsertCartridge: (arrayBuffer) ->
        logger.info "Inserting cartridge"
        cartridge = @cartridgeFactory.fromArrayBuffer arrayBuffer
        @nes.insertCartridge cartridge
        @nes.pressPower()

    isCartridgeInserted: ->
        @nes.isCartridgeInserted()

    ###########################################################
    # Cartridge persistence
    ###########################################################

    loadCartridgeData: ->
         if @nes.isCartridgeInserted()
            logger.info "Loading cartridge data"
            @nes.loadCartridgeData @storage

    saveCartridgeData: ->
        if @nes.isCartridgeInserted()
            logger.info "Saving cartridge data"
            @nes.saveCartridgeData @storage

module.exports = CartridgeManager
