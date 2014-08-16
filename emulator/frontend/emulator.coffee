TVSystem = require("../core/common/types").TVSystem
Joypad   = require "../core/controllers/joypad"
Binder   = require "../core/utils/binder"
Injector = require "../core/utils/injector"
network  = require "../core/utils/network"
Logger   = require "../core/utils/logger"

VIDEO_WIDTH  = require("../core/common/constants").VIDEO_WIDTH
VIDEO_HEIGHT = require("../core/common/constants").VIDEO_HEIGHT

logger = Logger.get()
logger.attach Logger.console() if network.isLocalhost()

nameToJoypadButton =
    "a":      Joypad.Button.A
    "b":      Joypad.Button.B
    "select": Joypad.Button.SELECT
    "start":  Joypad.Button.START
    "up":     Joypad.Button.UP
    "down":   Joypad.Button.DOWN
    "left":   Joypad.Button.LEFT
    "right":  Joypad.Button.RIGHT

nameToTVSystem =
    "ntsc": TVSystem.NTSC
    "pal":  TVSystem.PAL

###########################################################
# Emulator API
###########################################################

class Emulator

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
        @initVideoSmoothing()
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
        @injector = new Injector "../core/config/#{mode}-config"
        @nes = @injector.getInstance "nes"

    hardReset: ->
        logger.info "Hard reset"
        @nes.pressPower()

    softReset: ->
        logger.info "Soft reset"
        @nes.pressReset()

    setTVSystem: (tvSystem) ->
        logger.info "Setting TV system to '#{tvSystem or 'autodetection mode'}'"
        @tvSystem = tvSystem
        @nes.setTVSystem nameToTVSystem[tvSystem]
        @restart() if @isRunning()

    getTVSystem: ->
        @tvSystem or null

    ###########################################################
    # Video - output
    ###########################################################

    setVideoOutput: (canvas) ->
        logger.info "Setting video output"
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
    # Video - smoothing
    ###########################################################

    initVideoSmoothing: ->
        logger.info "Initializing video smoothing"
        @videoSmoothing = false

    setVideoSmoothing: (enabled) ->
        logger.info "Setting debugging video smoothing to #{if enabled then 'on' else 'off'}"
        @videoSmoothing = enabled
        @updateVideoRect() if @canvas

    isVideoSmoothing: ->
        @videoSmoothing

    applyVideoSmoothing: ->
        @renderer["imageSmoothingEnabled"] = @videoSmoothing
        @renderer["mozImageSmoothingEnabled"] = @videoSmoothing
        @renderer["oImageSmoothingEnabled"] = @videoSmoothing
        @renderer["webkitImageSmoothingEnabled"] = @videoSmoothing
        @renderer["msImageSmoothingEnabled"] = @videoSmoothing

    ###########################################################
    # Video - palette
    ###########################################################

    initVideoPalette: ->
        logger.info "Initializing video palette"
        @setVideoPalette()

    setVideoPalette: (name = "default") ->
        logger.info "Setting pallet to '#{name}'"
        @videoPalette = name
        @nes.setRGBAPalette require "../core/paletts/#{name}-palette"

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
        @applyVideoSmoothing()
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
        @storage = @injector.getInstance "storage"
        window.addEventListener "beforeunload", @saveAll

    setPeriodicSave: (period = 60000) ->
        if period
            logger.info "Enabling periodic save with period #{period} ms"
            @saveIntervalId = setInterval @saveAll, period
        else
            logger.info "Disabling periodic save"
            clearInterval @saveIntervalId

    saveAll: =>
        @saveData()
        @saveConfig()

    loadData: ->
        logger.info "Loding data"
        @nes.loadData @storage

    saveData: ->
        logger.info "Saving data"
        @nes.saveData @storage

    loadConfig: ->
        logger.info "Loading configuration"
        config = @storage.readObject "config"
        if config
            @setTVSystem config["tvSystem"]
            @setVideoPalette config["videoPalette"]
            @setVideoScale config["videoScale"]
            @setVideoSmoothing config["videoSmoothing"]
            @setVideoDebug config["videoDebug"]
            @setInputDevice 1, config["inputDevices"]?[1]
            @setInputDevice 2, config["inputDevices"]?[2]
            @loadControls config["controls"] or {}

    saveConfig: ->
        logger.info "Saving configuration"
        @storage.writeObject "config",
            "tvSystem": @getTVSystem()
            "videoPalette": @getVideoPalette()
            "videoScale": @getVideoScale()
            "videoSmoothing": @isVideoSmoothing()
            "videoDebug": @isVideoDebug()
            "inputDevices":
                1: @getInputDevice 1
                2: @getInputDevice 2
            "controls": @controls

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
        @clearControls()

    clearControls: ->
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
        @clearControls()
        @bindControl 1, "joypad", "a", "keyboard", "c"
        @bindControl 1, "joypad", "b", "keyboard", "x"
        @bindControl 1, "joypad", "start", "keyboard", "enter"
        @bindControl 1, "joypad", "select", "keyboard", "shift"
        @bindControl 1, "joypad", "up", "keyboard", "up"
        @bindControl 1, "joypad", "down", "keyboard", "down"
        @bindControl 1, "joypad", "left", "keyboard", "left"
        @bindControl 1, "joypad", "right", "keyboard", "right"
        @bindControl 2, "zapper", "trigger", "mouse", "left"

    loadControls: (controls) ->
        @clearControls()
        for dstPort, dstDevices of controls when dstDevices
            for dstDevice, dstButtons of dstDevices when dstButtons
                for dstButton, srcMapping of dstButtons when srcMapping
                    @bindControl dstPort, dstDevice, dstButton, srcMapping["device"], srcMapping["button"]
        undefined

    bindControl: (dstPort, dstDevice, dstButton, srcDevice, srcButton) ->
        @unbindControl   dstPort, dstDevice, dstButton, srcDevice, srcButton
        @bindInputDevice dstPort, dstDevice, dstButton, srcDevice, srcButton

    unbindControl: (dstPort, dstDevice, dstButton, srcDevice, srcButton) ->
        @dstUnbindCallbacks[dstPort][dstDevice][dstButton]?()
        @srcUnbindCallbacks[srcDevice][srcButton]?()

    getControl: (dstPort, dstDevice, dstButton) ->
        @controls[dstPort][dstDevice][dstButton]?["name"]

    bindInputDevice: (dstPort, dstDevice, dstButton, srcDevice, srcButton) ->
        logger.info "Binding '#{srcButton}' of '#{srcDevice}' to '#{dstDevice}' on port #{dstPort}"
        unbindInputDevice = @getUnbindInputDeviceCallback dstPort, dstDevice, dstButton, srcDevice, srcButton
        useInputDevice = @getUseInputDeviceCallback dstPort, dstDevice, dstButton
        @dstUnbindCallbacks[dstPort][dstDevice][dstButton] = unbindInputDevice
        @srcUnbindCallbacks[srcDevice][srcButton] = unbindInputDevice
        @controls[dstPort][dstDevice][dstButton] =
            "device": srcDevice
            "button": srcButton
            "name": @binder.bindControl srcDevice, srcButton, useInputDevice

    unbindInputDevice: (dstPort, dstDevice, dstButton, srcDevice, srcButton) ->
        logger.info "Unbinding '#{srcButton}' of '#{srcDevice}' and '#{dstDevice}' on port #{dstPort}"
        @binder.unbindControl srcDevice, srcButton
        @dstUnbindCallbacks[dstPort][dstDevice][dstButton] = null
        @srcUnbindCallbacks[srcDevice][srcButton] = null
        @controls[dstPort][dstDevice][dstButton] = null

    getUnbindInputDeviceCallback: (dstPort, dstDevice, dstButton, srcDevice, srcButton) ->
        self = @
        -> self.unbindInputDevice dstPort, dstDevice, dstButton, srcDevice, srcButton

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
# API export (for closure compiler)
###########################################################

this["NESCoffee"] = Emulator
this["NESCoffee"].prototype["bindControl"]        = Emulator.prototype.bindControl
this["NESCoffee"].prototype["decreaseVideoScale"] = Emulator.prototype.decreaseVideoScale
this["NESCoffee"].prototype["enterFullScreen"]    = Emulator.prototype.enterFullScreen
this["NESCoffee"].prototype["increaseVideoScale"] = Emulator.prototype.increaseVideoScale
this["NESCoffee"].prototype["insertCartridge"]    = Emulator.prototype.insertCartridge
this["NESCoffee"].prototype["isRunning"]          = Emulator.prototype.isRunning
this["NESCoffee"].prototype["isVideoDebug"]       = Emulator.prototype.isVideoDebug
this["NESCoffee"].prototype["isVideoSmoothing"]   = Emulator.prototype.isVideoSmoothing
this["NESCoffee"].prototype["getControl"]         = Emulator.prototype.getControl
this["NESCoffee"].prototype["getFPS"]             = Emulator.prototype.getFPS
this["NESCoffee"].prototype["getInputDevice"]     = Emulator.prototype.getInputDevice
this["NESCoffee"].prototype["getMaxVideoScale"]   = Emulator.prototype.getMaxVideoScale
this["NESCoffee"].prototype["getTVSystem"]        = Emulator.prototype.getTVSystem
this["NESCoffee"].prototype["getVideoPalette"]    = Emulator.prototype.getVideoPalette
this["NESCoffee"].prototype["getVideoScale"]      = Emulator.prototype.getVideoScale
this["NESCoffee"].prototype["hardReset"]          = Emulator.prototype.hardReset
this["NESCoffee"].prototype["loadCartridge"]      = Emulator.prototype.loadCartridge
this["NESCoffee"].prototype["onError"]            = Emulator.prototype.onError
this["NESCoffee"].prototype["onLoad"]             = Emulator.prototype.onLoad
this["NESCoffee"].prototype["recordInput"]        = Emulator.prototype.recordInput
this["NESCoffee"].prototype["setInputDevice"]     = Emulator.prototype.setInputDevice
this["NESCoffee"].prototype["setVideoDebug"]      = Emulator.prototype.setVideoDebug
this["NESCoffee"].prototype["setVideoSmoothing"]  = Emulator.prototype.setVideoSmoothing
this["NESCoffee"].prototype["setVideoOutput"]     = Emulator.prototype.setVideoOutput
this["NESCoffee"].prototype["setVideoPalette"]    = Emulator.prototype.setVideoPalette
this["NESCoffee"].prototype["setVideoScale"]      = Emulator.prototype.setVideoScale
this["NESCoffee"].prototype["setTVSystem"]        = Emulator.prototype.setTVSystem
this["NESCoffee"].prototype["useDefaultControls"] = Emulator.prototype.useDefaultControls
this["NESCoffee"].prototype["softReset"]          = Emulator.prototype.softReset
this["NESCoffee"].prototype["start"]              = Emulator.prototype.start
this["NESCoffee"].prototype["stop"]               = Emulator.prototype.stop
