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

joypadButtonToId =
    "a":      Joypad.BUTTON_A
    "b":      Joypad.BUTTON_B
    "select": Joypad.BUTTON_SELECT
    "start":  Joypad.BUTTON_START
    "up":     Joypad.BUTTON_UP
    "down":   Joypad.BUTTON_DOWN
    "left":   Joypad.BUTTON_LEFT
    "right":  Joypad.BUTTON_RIGHT

tvSystemToId =
    "ntsc": TVSystem.NTSC
    "pal":  TVSystem.PAL
    "auto": null

###########################################################
# NESCoffee main class
###########################################################

class @NESCoffee

    constructor: (@canvas, @mode = "base") ->
        unless @canvas?
            throw new Error "Canvas element or its ID was not specified."
        logger.info "Initializing NESCoffee"
        @initCanvas()
        @initRenderer()
        @initFramebuffer()
        @initConsole()
        @initControls()
        @initFPS()
        @initListeners()
        @setVideoPalette()
        @pressPower()
        @drawFrame()
        logger.info "Initialization done"

    ###########################################################
    # Initialization
    ###########################################################

    initCanvas: ->
        logger.info "Initializing canvas"
        @canvas = document.getElementById @canvas if typeof @canvas is "string"
        @canvas.width = VIDEO_WIDTH
        @canvas.height = VIDEO_HEIGHT
        @canvas.scale = 1 # Not part of canvas API

    initRenderer: ->
        logger.info "Initializing renderer"
        @renderer = @canvas.getContext "2d"

    initFramebuffer: ->
        logger.info "Initializing frambuffer"
        @frameBuffer = @renderer.createImageData VIDEO_WIDTH, VIDEO_HEIGHT
        for i in [0...@frameBuffer.data.length]
            @frameBuffer.data[i] = if (i & 0x03) != 0x03 then 0x00 else 0xFF # RGBA = 000000FF

    initConsole: ->
        logger.info "Initializing console"
        @injector = new Injector "./config/#{@mode}-config"
        @nes = @injector.getInstance "nes"
        @cartridgeFactory = @injector.getInstance "cartridgeFactory"
        @inputDevices =
            1: { joypad: @injector.getInstance("joypad"), zapper: @injector.getInstance("zapper") }
            2: { joypad: @injector.getInstance("joypad"), zapper: @injector.getInstance("zapper") }

    initControls: ->
        logger.info "Initializing controls"
        @binder = new Binder @getCanvasRect
        @unbindCallbacks1 =
            1: { joypad: {}, zapper: {} }
            2: { joypad: {}, zapper: {} }
        @unbindCallbacks2 = keyboard: {}, mouse: {}

    initFPS: ->
        logger.info "Initializing fps"
        @fpsBuffer = (0 for [1..10])
        @fpsIndex = 0
        @fpsTime = 0

    initListeners: ->
        logger.info "Initializing listeners"
        window.addEventListener "beforeunload", @saveData
        document.addEventListener screenfull.raw.fullscreenchange, @fullscreenChanged

    ###########################################################
    # Emulation
    ###########################################################

    start: ->
        logger.info "Starting emulation"
        @emuIntervalId = setInterval @step, 1000 / @getTargetFPS()

    stop: ->
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

    updateFPS: ->
        timeNow = Date.now()
        @fpsBuffer[@fpsIndex] = 1000 / (timeNow - @fpsTime)
        @fpsIndex = (@fpsIndex + 1) % @fpsBuffer.length
        @fpsTime = timeNow

    getTargetFPS: ->
        switch @nes.getTVSystem()
            when TVSystem.NTSC then 60.0988
            when TVSystem.PAL  then 50.0070
            else throw new Error "Unsupported TV system."

    getFPS: ->
        (@fpsBuffer.reduce (a, b) -> a + b) / @fpsBuffer.length

    ###########################################################
    # Persistence
    ###########################################################

    setStorage: (storage) ->
        logger.info "Setting storage"
        @nes.setStorage storage

    loadData: ->
        logger.info "Loding data"
        @nes.loadData()

    saveData: =>
        logger.info "Saving data"
        @nes.saveData()

    setPeriodicSave: (period) ->
        if period
            logger.info "Enabling periodic save with period #{period} ms"
            @saveIntervalId = setInterval @saveData, period
        else
            logger.info "Disabling periodic save"
            clearInterval @saveIntervalId

    ###########################################################
    # Video - rendering
    ###########################################################

    renderFrame: ->
        @nes.renderFrame @frameBuffer.data

    drawFrame: ->
        @renderer.putImageData @frameBuffer, 0, 0
        @redrawScaledCanvas() if @canvas.scale > 1

    redrawScaledCanvas: ->
        @renderer.imageSmoothingEnabled = false
        @renderer.mozImageSmoothingEnabled = false
        @renderer.oImageSmoothingEnabled = false
        @renderer.webkitImageSmoothingEnabled = false
        @renderer.msImageSmoothingEnabled = false
        @renderer.drawImage @canvas, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT, 0, 0, @canvas.width, @canvas.height

    getCanvasRect: =>
        @canvas.getBoundingClientRect()

    ###########################################################
    # Video - scalling
    ###########################################################

    setVideoScale: (scale) ->
        logger.info "Setting video scale to #{scale}"
        @canvas.scale = scale
        @canvas.width = scale * VIDEO_WIDTH
        @canvas.height = scale * VIDEO_HEIGHT
        @drawFrame()

    setMaxVideoScale: ->
        @setVideoScale @getMaxVideoScale()

    increaseVideoScale: ->
        @setVideoScale @canvas.scale + 1 if @canvas.scale < @getMaxVideoScale()

    decreaseVideoScale: ->
        @setVideoScale @canvas.scale - 1 if @canvas.scale > 1

    getVideoScale: ->
        @canvas.scale

    getMaxVideoScale: ->
        ~~Math.min(screen.width / VIDEO_WIDTH, screen.height / VIDEO_HEIGHT)

    ###########################################################
    # Video - fullscreen
    ###########################################################

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
        logger.info "Fullscreen state changed to #{if @isFullScreen() then 'on' else 'off'}"
        if @isFullScreen() # Must be only called when leaving fullscreen
            @canvas.previousScale = @canvas.scale
            @setMaxVideoScale()
        else
            @setVideoScale @canvas.previousScale
            @canvas.previousScale = null

    isFullScreen: ->
        screenfull.isFullscreen

    ###########################################################
    # Video - other
    ###########################################################

    setVideoPalette: (palette = "default") ->
        logger.info "Setting pallet to '#{palette}'"
        palette = require "./paletts/#{palette}-palette" if typeof palette is "string"
        @nes.setVideoPalette palette

    setVideoDebug: (enabled) ->
        logger.info "Setting video debug to #{enabled}"
        @nes.setVideoDebug enabled

    setTVSystem: (system) ->
        system = tvSystemToId[system]
        name = if system? then TVSystem.toString system else "Autodetect"
        logger.info "Setting TV system to '#{name}'"
        @nes.setTVSystem system
        @restart() if @isRunning()

    ###########################################################
    # Zapper light detection
    ###########################################################

    updateZapper: ->
        rect = @getCanvasRect()
        scaleX = (rect.right - rect.left) / VIDEO_WIDTH
        scaleY = (rect.bottom - rect.top) / VIDEO_HEIGHT
        x = ~~((@binder.mouseX - rect.left) / scaleX)
        y = ~~((@binder.mouseY - rect.top - 1) / scaleY)
        x = 0 if x < 0 or x >= VIDEO_WIDTH
        y = 0 if y < 0 or y >= VIDEO_HEIGHT
        @inputDevices[1].zapper.setScreenPosition x, y
        @inputDevices[2].zapper.setScreenPosition x, y

    ###########################################################
    # Controls
    ###########################################################

    pressPower: ->
        logger.info "Pressing power"
        @nes.pressPower()

    pressReset: ->
        logger.info "Pressing reset"
        @nes.pressReset()

    setInputDevice: (port, device) ->
        logger.info "Setting input device on port #{port} to '#{device}'"
        device = @inputDevices[port]?[device] or null if typeof device is "string"
        @nes.connectInputDevice port, device

    getInputDevice: (port) ->
        device = @nes.getConnectedInputDevice port
        if      device instanceof @injector.getClass "joypad" then "joypad"
        else if device instanceof @injector.getClass "zapper" then "zapper"
        else    null

    ###########################################################
    # Cartridges loading
    ###########################################################

    enableFileOpening: (element, onLoad, onError) ->
        logger.info "File opening enabled on '#{element}'"
        self = @
        element = document.getElementById element if typeof element is "string"
        element.addEventListener "change", (event) ->
            self.handleOpenedFile event, onLoad, onError

    enableFileDropping: (element, onLoad, onError) ->
        logger.info "File dropping enabled on '#{element}'"
        self = @
        element = document.getElementById element if typeof element is "string"
        element.addEventListener "dragover", (event) ->
            self.handleDraggedFile event
        element.addEventListener "drop", (event) ->
            self.handleDroppedFile event, onLoad, onError

    handleOpenedFile: (event, onLoad, onError) =>
        logger.info "Received file open event '#{event}'"
        event.preventDefault()
        event.stopPropagation()
        file = event.target.files[0]
        @loadCartridge file, onLoad, onError if file

    handleDraggedFile: (event) ->
        event.preventDefault()
        event.stopPropagation()
        event.dataTransfer.dropEffect = "copy"

    handleDroppedFile: (event, onLoad, onError) =>
        logger.info "Received file drop event '#{event}'"
        event.preventDefault()
        event.stopPropagation()
        file = event.dataTransfer.files[0]
        @loadCartridge file, onLoad, onError if file

    loadCartridge: (file, onLoad, onError) ->
        logger.info "Loding cartridge from file"
        self = @
        onLoad ?= @onLoad
        onError ?= @onError
        reader = new FileReader
        reader.onload = (event) ->
            result = event.target.result
            error = self.tryInsertCartridge result
            if error
                onError?.call self, error
            else
                onLoad?.call self, result
        reader.onerror = (event) ->
            onError?.call self, event.target.error
        reader.readAsArrayBuffer file

    downloadCartridge: (url, onLoad, onError) ->
        logger.info "Downloading cartridge from '#{url}'"
        self = @
        onLoad ?= @onLoad
        onError ?= @onError
        request = new XMLHttpRequest
        request.open "GET", url, true
        request.responseType = "arraybuffer";
        request.onload = ->
            if @status is 200
                error = self.tryInsertCartridge @response
            else
                error = "Unable to download file '#{url}' (status code: #{@status})."
            if error
                logger.error error
                onError?.call self, error, @status
            else
                onLoad?.call self, @response
        try
            request.send()
        catch error
            logger.error error
            onError?.call self, error

    tryInsertCartridge: (arrayBuffer) ->
        try
            @insertCartridge arrayBuffer
        catch error
            logger.error error
            return error

    insertCartridge: (arrayBuffer) ->
        @saveData()
        logger.info "Inserting cartridge"
        cartridge = @cartridgeFactory.fromArrayBuffer arrayBuffer
        @nes.insertCartridge cartridge
        @loadData()
        @restart() if @isRunning()
        undefined

    isCartridgeInserted: ->
        @nes.isCartridgeInserted()

    ###########################################################
    # Controls binding
    ###########################################################

    useDefaultControls: ->
        logger.info "Using default controls"
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

    bindControl: (port, device, button, srcDevice, srcButton, unbindCallback) ->
        @unbindControl   port, device, button, srcDevice, srcButton
        @bindInputDevice port, device, button, srcDevice, srcButton, unbindCallback

    unbindControl: (port, device, button, srcDevice, srcButton) ->
        @unbindCallbacks1[port]?[device]?[button]?() if port and device and button
        @unbindCallbacks2[srcDevice]?[srcButton]?()  if srcDevice and srcButton

    bindInputDevice: (port, device, button, srcDevice, srcButton, unbindCallback) ->
        logger.info "Binding '#{srcButton}' of '#{srcDevice}' to '#{device}' on port #{port}"
        unbindInputDevice = @getUnbindInputDeviceCallback port, device, button, srcDevice, srcButton, unbindCallback
        useInputDevice = @getUseInputDeviceCallback port, device, button
        @unbindCallbacks1[port]?[device]?[button] = unbindInputDevice
        @unbindCallbacks2[srcDevice]?[srcButton] = unbindInputDevice
        @binder.bindControl srcDevice, srcButton, useInputDevice

    unbindInputDevice: (port, device, button, srcDevice, srcButton) ->
        logger.info "Unbinding '#{srcButton}' of '#{srcDevice}' and '#{device}' on port #{port}"
        @binder.unbindControl srcDevice, srcButton
        @unbindCallbacks1[port]?[device]?[button] = null
        @unbindCallbacks2[srcDevice]?[srcButton] = null

    getUnbindInputDeviceCallback: (port, device, button, srcDevice, srcButton, unbindCallback) ->
        self = @
        ->
            self.unbindInputDevice port, device, button, srcDevice, srcButton
            unbindCallback()

    getUseInputDeviceCallback: (port, device, button) ->
        if device is "joypad"
            button = joypadButtonToId[button.toLowerCase()] or 0
            @inputDevices[port]?.joypad.setButtonPressed.bind this, button
        else if device is "zapper"
            @inputDevices[port]?.zapper.setTriggerPressed.bind this

    ###########################################################
    # Input recording
    ###########################################################

    recordInput: (callback) ->
        logger.info "Recording input"
        @binder.recordInput callback
