Joypad   = require "./controllers/joypad"
Binder   = require "./utils/binder"
Injector = require "./utils/injector"
network  = require "./utils/network"

types = require "./common/types"
TVSystem = types.TVSystem

Logger = require "./utils/logger"
logger = Logger.get()
logger.attach Logger.console() if network.isLocalhost()

VIDEO_WIDTH  = 256
VIDEO_HEIGHT = 240

nameToJoypadButton =
    "a":      Joypad.BUTTON_A
    "b":      Joypad.BUTTON_B
    "select": Joypad.BUTTON_SELECT
    "start":  Joypad.BUTTON_START
    "up":     Joypad.BUTTON_UP
    "down":   Joypad.BUTTON_DOWN
    "left":   Joypad.BUTTON_LEFT
    "right":  Joypad.BUTTON_RIGHT

nameToTVSystem =
    "ntsc": TVSystem.NTSC
    "pal":  TVSystem.PAL
    "auto": null

###########################################################
# NESCoffee emulator
###########################################################

class NESCoffee

    ###########################################################
    # Initialization
    ###########################################################

    constructor: (mode = "base") ->
        logger.info "Initializing emulator"
        @initConsole mode
        @initCartridges()
        @initInputDevices()
        @initControls()
        @initFPS()
        @initStorage()
        @initVideoScale()
        @initVideoDebug()
        @initVideoPalette()
        @initFullscreen()
        @useDefaultControls()
        @loadConfig()
        @hardReset()
        logger.info "Emulator initialization done"

    ###########################################################
    # Emulation
    ###########################################################

    start: ->
        unless @isRunning()
            logger.info "Starting emulation"
            @emuIntervalId = setInterval @step, 1000 / @getTargetFPS()

    stop: ->
        if @isRunning()
            logger.info "Stopping emulation"
            clearInterval @emuIntervalId
            @emuIntervalId = null

    restart: ->
        @stop()
        @start()

    isRunning: ->
        @emuIntervalId?

    step: =>
        @renderFrame()
        @drawFrame()
        @updateZapper()
        @updateFPS()

    ###########################################################
    # Console
    ###########################################################

    initConsole: (mode) ->
        logger.info "Initializing console"
        @injector = new Injector "./config/#{mode}-config"
        @nes = @injector.getInstance "nes"

    hardReset: ->
        logger.info "Hard reset"
        @nes.pressPower()

    softReset: ->
        logger.info "Soft reset"
        @nes.pressReset()

    setTVSystem: (tvSystem = "auto") ->
        logger.info "Setting TV system to '#{tvSystem}'"
        @tvSystem = tvSystem
        @nes.setTVSystem nameToTVSystem[tvSystem]
        @restart() if @isRunning()

    getTVSystem: ->
        @tvSystem or "auto"

    ###########################################################
    # Video - output
    ###########################################################

    setVideoOutput: (canvas) ->
        logger.info "Setting canvas"
        @canvas = canvas
        @updateVideoRect()
        @initRenderer()
        @renderFrame() if @nes.isCartridgeInserted()
        @drawFrame()

    updateVideoRect: ->
        widthMultiplier = if @videoDebug then 2 else 1
        @canvas.width = @videoScale * VIDEO_WIDTH * widthMultiplier
        @canvas.height = @videoScale * VIDEO_HEIGHT

    getVideoRect: =>
        if @canvas
            rect = @canvas.getBoundingClientRect()
            rect.right -= (rect.right - rect.left) / 2 if @videoDebug
            rect
        else
            { left: -1, right: -1, top: -1, bottom: -1 }

    ###########################################################
    # Video - debugging output
    ###########################################################

    initVideoDebug: ->
        logger.info "Initializing video debug output"
        @videoDebug = false

    setVideoDebug: (enabled = true) ->
        logger.info "Setting debugging video output to #{if enabled then 'on' else 'off'}"
        @videoDebug = enabled
        @updateVideoRect() if @canvas

    isVideoDebug: ->
        @videoDebug

    ###########################################################
    # Video - palette
    ###########################################################

    initVideoPalette: ->
        logger.info "Initializing video palette"
        @setVideoPalette()

    setVideoPalette: (name = "default") ->
        logger.info "Setting pallet to '#{name}'"
        @videoPalette = name
        @nes.setRGBAPalette require "./paletts/#{name}-palette"

    getVideoPalette: ->
        @videoPalette

    ###########################################################
    # Video - scalling
    ###########################################################

    initVideoScale: ->
        logger.info "Initializing video scale"
        @videoScale ?= 1

    setVideoScale: (scale = 1) ->
        logger.info "Setting video scale to #{scale}"
        @videoScale = scale
        if @canvas
            @updateVideoRect()
            @drawFrame()

    setMaxVideoScale: ->
        @setVideoScale @getMaxVideoScale()

    increaseVideoScale: ->
        @setVideoScale @videoScale + 1 if @videoScale < @getMaxVideoScale()

    decreaseVideoScale: ->
        @setVideoScale @videoScale - 1 if @videoScale > 1

    getVideoScale: ->
        @videoScale

    getMaxVideoScale: ->
        ~~Math.min(screen.width / VIDEO_WIDTH, screen.height / VIDEO_HEIGHT)

    ###########################################################
    # Video - fullscreen
    ###########################################################

    initFullscreen: ->
        logger.info "Initializing fullscreen rendering"
        document.addEventListener screenfull.raw.fullscreenchange, @fullscreenChanged

    setFullScreen: (fullscreen) ->
        if fullscreen
            @enterFullScreen()
        else
            @leaveFullScreen()

    enterFullScreen: ->
        if screenfull.enabled and not @isFullScreen()
            logger.info "Entering fullscreen"
            screenfull.request @canvas

    leaveFullScreen: ->
        if screenfull.enabled and @isFullScreen()
            logger.info "Leaving fullscreen"
            screenfull.exit()

    fullscreenChanged: =>
        logger.info "Fullscreen changed to #{if @isFullScreen() then 'on' else 'off'}"
        if @isFullScreen() # Must be only called when leaving fullscreen
            @canvasPreviousScale = @videoScale
            @setMaxVideoScale()
        else
            @setVideoScale @canvasPreviousScale
            @canvasPreviousScale = null

    isFullScreen: ->
        screenfull.isFullscreen

    ###########################################################
    # Video - rendering
    ###########################################################

    initRenderer: ->
        logger.info "Initializing renderer"
        @renderer = @canvas.getContext "2d"
        @frame = @createFrame()
        @debugFrame = @createFrame()

    createFrame: ->
        frame = @renderer.createImageData VIDEO_WIDTH, VIDEO_HEIGHT
        for i in [0...frame.data.length]
            frame.data[i] = if (i & 0x03) != 0x03 then 0x00 else 0xFF # RGBA = 000000FF
        frame

    renderFrame: ->
        @nes.renderFrame @frame.data
        @nes.renderDebugFrame @debugFrame.data if @videoDebug

    drawFrame: ->
        @renderer.putImageData @frame, 0, 0
        @renderer.putImageData @debugFrame, VIDEO_WIDTH, 0 if @videoDebug
        @redrawScaledFrame() if @videoScale >  1

    redrawScaledFrame: ->
        @renderer["imageSmoothingEnabled"] = false
        @renderer["mozImageSmoothingEnabled"] = false
        @renderer["oImageSmoothingEnabled"] = false
        @renderer["webkitImageSmoothingEnabled"] = false
        @renderer["msImageSmoothingEnabled"] = false
        sw = @canvas.width / @videoScale
        sh = @canvas.height / @videoScale
        dw = @canvas.width
        dh = @canvas.height
        @renderer.drawImage @canvas, 0, 0, sw, sh, 0, 0, dw, dh

    ###########################################################
    # FPS conting
    ###########################################################

    initFPS: ->
        logger.info "Initializing fps"
        @fpsBuffer = (0 for [1..10])
        @fpsIndex = 0
        @fpsTime = 0

    updateFPS: ->
        timeNow = Date.now()
        @fpsBuffer[@fpsIndex] = 1000 / (timeNow - @fpsTime)
        @fpsIndex = (@fpsIndex + 1) % @fpsBuffer.length
        @fpsTime = timeNow

    getFPS: ->
        (@fpsBuffer.reduce (a, b) -> a + b) / @fpsBuffer.length

    getTargetFPS: ->
        switch @nes.getTVSystem()
            when TVSystem.NTSC then 60.0988
            when TVSystem.PAL  then 50.0070
            else throw new Error "Unsupported TV system."


    ###########################################################
    # Persistence
    ###########################################################

    initStorage: ->
        logger.info "Initializing storage"
        window.addEventListener "beforeunload", @saveData

    setStorage: (storage) ->
        logger.info "Setting storage"
        @nes.setStorage storage

    loadData: ->
        logger.info "Loding data"
        @nes.loadData()

    saveData: =>
        logger.info "Saving data"
        @nes.saveData()

    setPeriodicSave: (period = 60000) ->
        if period
            logger.info "Enabling periodic save with period #{period} ms"
            @saveIntervalId = setInterval @saveData, period
        else
            logger.info "Disabling periodic save"
            clearInterval @saveIntervalId

    ###########################################################
    # Input devices
    ###########################################################

    initInputDevices: ->
        logger.info "Initializing input devices"
        @inputDevices =
                1: @createInputDevices()
                2: @createInputDevices()

    createInputDevices: ->
        "joypad": @injector.getInstance "joypad"
        "zapper": @injector.getInstance "zapper"

    setInputDevice: (port, device) ->
        logger.info "Setting input device on port #{port} to '#{device}'"
        device = @inputDevices[port]?[device] or null
        @nes.connectInputDevice port, device

    getInputDevice: (port) ->
        device = @nes.getConnectedInputDevice port
        if      device instanceof @injector.getClass "joypad" then "joypad"
        else if device instanceof @injector.getClass "zapper" then "zapper"
        else    null

    updateZapper: ->
        rect = @getVideoRect()
        scaleX = (rect.right - rect.left) / VIDEO_WIDTH
        scaleY = (rect.bottom - rect.top) / VIDEO_HEIGHT
        x = ~~((@binder.mouseX - rect.left) / scaleX)
        y = ~~((@binder.mouseY - rect.top - 1) / scaleY)
        x = 0 if x < 0 or x >= VIDEO_WIDTH
        y = 0 if y < 0 or y >= VIDEO_HEIGHT
        @inputDevices[1]["zapper"].setScreenPosition x, y
        @inputDevices[2]["zapper"].setScreenPosition x, y

    ###########################################################
    # Controls
    ###########################################################

    initControls: ->
        logger.info "Initializing controls"
        @binder = new Binder @getVideoRect
        @controls =
            1: { "joypad": {}, "zapper": {} }
            2: { "joypad": {}, "zapper": {} }
        @dstUnbindCallbacks =
            1: { "joypad": {}, "zapper": {} }
            2: { "joypad": {}, "zapper": {} }
        @srcUnbindCallbacks = "keyboard": {}, "mouse": {}

    useDefaultControls: ->
        logger.info "Using default controls"
        @setInputDevice 1, "joypad"
        @setInputDevice 2, "zapper"
        @binder.unbindAll()
        @bindControl 1, "joypad", "a", "keyboard", "c"
        @bindControl 1, "joypad", "b", "keyboard", "x"
        @bindControl 1, "joypad", "start", "keyboard", "enter"
        @bindControl 1, "joypad", "select", "keyboard", "shift"
        @bindControl 1, "joypad", "up", "keyboard", "up"
        @bindControl 1, "joypad", "down", "keyboard", "down"
        @bindControl 1, "joypad", "left", "keyboard", "left"
        @bindControl 1, "joypad", "right", "keyboard", "right"
        @bindControl 2, "zapper", "trigger", "mouse", "left"

    bindControl: (dstPort, dstDevice, dstButton, srcDevice, srcButton, unbindCallback) ->
        @unbindControl   dstPort, dstDevice, dstButton, srcDevice, srcButton
        @bindInputDevice dstPort, dstDevice, dstButton, srcDevice, srcButton, unbindCallback

    unbindControl: (dstPort, dstDevice, dstButton, srcDevice, srcButton) ->
        @dstUnbindCallbacks[dstPort][dstDevice][dstButton]?()
        @srcUnbindCallbacks[srcDevice][srcButton]?()


    getControl: (dstPort, dstDevice, dstButton) ->
        @controls[dstPort][dstDevice][dstButton]

    bindInputDevice: (dstPort, dstDevice, dstButton, srcDevice, srcButton, unbindCallback) ->
        logger.info "Binding '#{srcButton}' of '#{srcDevice}' to '#{dstDevice}' on port #{dstPort}"
        unbindInputDevice = @getUnbindInputDeviceCallback dstPort, dstDevice, dstButton, srcDevice, srcButton, unbindCallback
        useInputDevice = @getUseInputDeviceCallback dstPort, dstDevice, dstButton
        @dstUnbindCallbacks[dstPort][dstDevice][dstButton] = unbindInputDevice
        @srcUnbindCallbacks[srcDevice][srcButton] = unbindInputDevice
        @controls[dstPort][dstDevice][dstButton] = @binder.bindControl srcDevice, srcButton, useInputDevice

    unbindInputDevice: (dstPort, dstDevice, dstButton, srcDevice, srcButton) ->
        logger.info "Unbinding '#{srcButton}' of '#{srcDevice}' and '#{dstDevice}' on port #{dstPort}"
        @binder.unbindControl srcDevice, srcButton
        @dstUnbindCallbacks[dstPort][dstDevice][dstButton] = null
        @srcUnbindCallbacks[srcDevice][srcButton] = null
        @controls[dstPort][dstDevice][dstButton] = null

    getUnbindInputDeviceCallback: (dstPort, dstDevice, dstButton, srcDevice, srcButton, unbindCallback) ->
        self = @
        ->
            self.unbindInputDevice dstPort, dstDevice, dstButton, srcDevice, srcButton
            unbindCallback?()

    getUseInputDeviceCallback: (dstPort, dstDevice, dstButton) ->
        if dstDevice is "joypad"
            dstButton = nameToJoypadButton[dstButton.toLowerCase()] or 0
            @inputDevices[dstPort]["joypad"].setButtonPressed.bind this, dstButton
        else if dstDevice is "zapper"
            @inputDevices[dstPort]["zapper"].setTriggerPressed.bind this

    ###########################################################
    # Input recording
    ###########################################################

    recordInput: (callback) ->
        logger.info "Recording input"
        @binder.recordInput callback

    ###########################################################
    # Cartridges
    ###########################################################

    initCartridges: ->
        logger.info "Initializing cartridge loading"
        @cartridgeFactory = @injector.getInstance "cartridgeFactory"

    loadCartridge: (file, onLoad, onError) ->
        logger.info "Loding cartridge from file"
        self = @
        onLoad ?= @["onLoad"]
        onError ?= @["onError"]
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
        onLoad ?= @["onLoad"]
        onError ?= @["onError"]
        request = new XMLHttpRequest
        request.open "GET", url, true
        request.responseType = "arraybuffer";
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

    insertCartridge: (arrayBuffer) ->
        try
            @doInsertCartridge arrayBuffer
            undefined
        catch error
            logger.error error
            error.message or "Internal error."

    doInsertCartridge: (arrayBuffer) ->
        logger.info "Inserting cartridge"
        @saveData()
        cartridge = @cartridgeFactory.fromArrayBuffer arrayBuffer
        @nes.insertCartridge cartridge
        @nes.pressPower()
        @loadData()
        @restart() if @isRunning()

    isCartridgeInserted: ->
        @nes.isCartridgeInserted()

    ###########################################################
    # Configuration
    ###########################################################

    loadConfig: ->

    saveConfig: ->

###########################################################
# API export (for closure compiler)
###########################################################

this["NESCoffee"] = NESCoffee
this["NESCoffee"].prototype["bindControl"]        = NESCoffee.prototype.bindControl
this["NESCoffee"].prototype["decreaseVideoScale"] = NESCoffee.prototype.decreaseVideoScale
this["NESCoffee"].prototype["enterFullScreen"]    = NESCoffee.prototype.enterFullScreen
this["NESCoffee"].prototype["increaseVideoScale"] = NESCoffee.prototype.increaseVideoScale
this["NESCoffee"].prototype["insertCartridge"]    = NESCoffee.prototype.insertCartridge
this["NESCoffee"].prototype["isRunning"]          = NESCoffee.prototype.isRunning
this["NESCoffee"].prototype["isVideoDebug"]       = NESCoffee.prototype.isVideoDebug
this["NESCoffee"].prototype["getControl"]         = NESCoffee.prototype.getControl
this["NESCoffee"].prototype["getFPS"]             = NESCoffee.prototype.getFPS
this["NESCoffee"].prototype["getInputDevice"]     = NESCoffee.prototype.getInputDevice
this["NESCoffee"].prototype["getMaxVideoScale"]   = NESCoffee.prototype.getMaxVideoScale
this["NESCoffee"].prototype["getTVSystem"]        = NESCoffee.prototype.getTVSystem
this["NESCoffee"].prototype["getVideoPalette"]    = NESCoffee.prototype.getVideoPalette
this["NESCoffee"].prototype["getVideoScale"]      = NESCoffee.prototype.getVideoScale
this["NESCoffee"].prototype["hardReset"]          = NESCoffee.prototype.hardReset
this["NESCoffee"].prototype["loadCartridge"]      = NESCoffee.prototype.loadCartridge
this["NESCoffee"].prototype["onError"]            = NESCoffee.prototype.onError
this["NESCoffee"].prototype["onLoad"]             = NESCoffee.prototype.onLoad
this["NESCoffee"].prototype["recordInput"]        = NESCoffee.prototype.recordInput
this["NESCoffee"].prototype["setInputDevice"]     = NESCoffee.prototype.setInputDevice
this["NESCoffee"].prototype["setVideoDebug"]      = NESCoffee.prototype.setVideoDebug
this["NESCoffee"].prototype["setVideoOutput"]     = NESCoffee.prototype.setVideoOutput
this["NESCoffee"].prototype["setVideoPalette"]    = NESCoffee.prototype.setVideoPalette
this["NESCoffee"].prototype["setVideoScale"]      = NESCoffee.prototype.setVideoScale
this["NESCoffee"].prototype["setTVSystem"]        = NESCoffee.prototype.setTVSystem
this["NESCoffee"].prototype["useDefaultControls"] = NESCoffee.prototype.useDefaultControls
this["NESCoffee"].prototype["softReset"]          = NESCoffee.prototype.softReset
this["NESCoffee"].prototype["start"]              = NESCoffee.prototype.start
this["NESCoffee"].prototype["stop"]               = NESCoffee.prototype.stop
