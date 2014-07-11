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

getElementById = (id) ->
    if typeof id is "string"
        element = document.getElementById id
        unless element
            throw new Error "Unable to locate element with ID='#{id}'."
        element
    else
        id

###########################################################
# NESCoffee main class
###########################################################

class @NESCoffee

    constructor: (@mode = "base") ->
        logger.info "Initializing emulator"
        @initConsole()
        @initControls()
        @initFPS()
        @initListeners()
        @setVideoPalette()
        @pressPower()
        logger.info "Initialization done"

    ###########################################################
    # Initialization
    ###########################################################


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
        @binder = new Binder @getVideoRect
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
    # Video - initialization
    ###########################################################

    initVideo: ->
        logger.info "Initializing video"
        @initCanvas()
        @initRenderer()
        @initFrameBuffer()
        @renderFrame() if @nes.isCartridgeInserted()
        @drawFrame()
        logger.info "Initialization done"

    initCanvas: ->
        logger.info "Initializing canvas"
        @canvas = getElementById @canvas
        @canvasScale ?= 1
        @updateVideoSize()

    initRenderer: ->
        logger.info "Initializing renderer"
        @renderer = @canvas.getContext "2d"

    initFrameBuffer: ->
        logger.info "Initializing frambuffer"
        @frameBuffer = @createFrameBuffer()
        @debugFrameBuffer = @createFrameBuffer()

    createFrameBuffer: ->
        buffer = @renderer.createImageData VIDEO_WIDTH, VIDEO_HEIGHT
        for i in [0...buffer.data.length]
            buffer.data[i] = if (i & 0x03) != 0x03 then 0x00 else 0xFF # RGBA = 000000FF
        buffer

    ###########################################################
    # Video - rendering
    ###########################################################

    renderFrame: ->
        @nes.renderFrame @frameBuffer.data
        @nes.renderDebugFrame @debugFrameBuffer.data if @videoDebug

    drawFrame: ->
        @renderer.putImageData @frameBuffer, 0, 0
        @renderer.putImageData @debugFrameBuffer, VIDEO_WIDTH, 0 if @videoDebug
        @redrawScaledFrame() if @canvasScale >  1

    redrawScaledFrame: ->
        @renderer.imageSmoothingEnabled = false
        @renderer.mozImageSmoothingEnabled = false
        @renderer.oImageSmoothingEnabled = false
        @renderer.webkitImageSmoothingEnabled = false
        @renderer.msImageSmoothingEnabled = false
        sw = @canvas.width / @canvasScale
        sh = @canvas.height / @canvasScale
        dw = @canvas.width
        dh = @canvas.height
        @renderer.drawImage @canvas, 0, 0, sw, sh, 0, 0, dw, dh

    ###########################################################
    # Video - output
    ###########################################################

    setVideoOutput: (canvas) ->
        @canvas = getElementById canvas
        @initVideo()

    setVideoPalette: (palette = "default") ->
        logger.info "Setting pallet to '#{palette}'"
        palette = require "./paletts/#{palette}-palette" if typeof palette is "string"
        @nes.setVideoPalette palette

    setVideoDebug: (enabled) ->
        logger.info "Setting video debug to #{enabled}"
        @videoDebug = enabled
        @updateVideoSize()

    updateVideoSize: ->
        widthMultiplier = if @videoDebug then 2 else 1
        @canvas.width = @canvasScale * VIDEO_WIDTH * widthMultiplier
        @canvas.height = @canvasScale * VIDEO_HEIGHT

    setTVSystem: (system) ->
        system = tvSystemToId[system]
        name = if system? then TVSystem.toString system else "Autodetect"
        logger.info "Setting TV system to '#{name}'"
        @nes.setTVSystem system
        @restart() if @isRunning()

    getVideoRect: =>
        if @canvas
            @canvas.getBoundingClientRect()
        else
            { left: -1, right: -1, top: -1, bottom: -1 }

    ###########################################################
    # Video - scalling
    ###########################################################

    setVideoScale: (scale = 1) ->
        logger.info "Setting video scale to #{scale}"
        @canvasScale = scale
        @updateVideoSize()
        @drawFrame()

    setMaxVideoScale: ->
        @setVideoScale @getMaxVideoScale()

    increaseVideoScale: ->
        @setVideoScale @canvasScale + 1 if @canvasScale < @getMaxVideoScale()

    decreaseVideoScale: ->
        @setVideoScale @canvasScale - 1 if @canvasScale > 1

    getVideoScale: ->
        @canvasScale

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
            @canvasPreviousScale = @canvasScale
            @setMaxVideoScale()
        else
            @setVideoScale @canvasPreviousScale
            @canvasPreviousScale = null

    isFullScreen: ->
        screenfull.isFullscreen

    ###########################################################
    # Zapper light detection
    ###########################################################

    updateZapper: ->
        rect = @getVideoRect()
        scaleX = (rect.right - rect.left) / VIDEO_WIDTH
        scaleY = (rect.bottom - rect.top) / VIDEO_HEIGHT
        x = ~~((@binder.mouseX - rect.left) / scaleX)
        y = ~~((@binder.mouseY - rect.top - 1) / scaleY)
        x = 0 if x < 0 or x >= VIDEO_WIDTH
        y = 0 if y < 0 or y >= VIDEO_HEIGHT
        @inputDevices[1].zapper.setScreenPosition x, y
        @inputDevices[2].zapper.setScreenPosition x, y

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
    # Controls binding
    ###########################################################

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

    ###########################################################
    # Cartridges loading
    ###########################################################

    loadCartridge: (file, onLoad, onError) ->
        logger.info "Loding cartridge from file"
        self = @
        onLoad ?= @onLoad
        onError ?= @onError
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
        onLoad ?= @onLoad
        onError ?= @onError
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
