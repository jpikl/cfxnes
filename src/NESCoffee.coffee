Injector = require "./utils/Injector"
Joypad   = require "./controllers/Joypad"
Format   = require "./utils/Format"
Binder   = require "./Binder"

SCREEN_FPS    = 60.0988
SCREEN_WIDTH  = 256
SCREEN_HEIGHT = 240

capitalize = Format.capitalize

joypadButtonToId =
    "a":      Joypad.BUTTON_A
    "b":      Joypad.BUTTON_B
    "select": Joypad.BUTTON_SELECT
    "start":  Joypad.BUTTON_START
    "up":     Joypad.BUTTON_UP
    "down":   Joypad.BUTTON_DOWN
    "left":   Joypad.BUTTON_LEFT
    "right":  Joypad.BUTTON_RIGHT

###########################################################
# NESCoffee main class
###########################################################

class @NESCoffee

    constructor: (@canvas, @mode = "base") ->
        throw "Canvas element or its ID was not specified." unless @canvas?
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

    ###########################################################
    # Initialization
    ###########################################################

    initCanvas: ->
        @canvas = document.getElementById @canvas if typeof @canvas is "string"
        @canvas.width = SCREEN_WIDTH
        @canvas.height = SCREEN_HEIGHT
        @canvasScale = 1

    initRenderer: ->
        @renderer = @canvas.getContext "2d"

    initFramebuffer: ->
        @frameBuffer = @renderer.createImageData SCREEN_WIDTH, SCREEN_HEIGHT
        for i in [0...@frameBuffer.data.length]
            @frameBuffer.data[i] = if (i & 0x03) != 0x03 then 0x00 else 0xFF # RGBA = 000000FF

    initConsole: ->
        @injector = new Injector "./config/#{capitalize @mode}Config"
        @nes = @injector.getInstance "nes"
        @cartridgeFactory = @injector.getInstance "cartridgeFactory"
        @inputDevices =
            1: { joypad: @injector.getInstance("joypad"), zapper: @injector.getInstance("zapper") }
            2: { joypad: @injector.getInstance("joypad"), zapper: @injector.getInstance("zapper") }

    initControls: ->
        @binder = new Binder @getCanvasRect
        @unbindCallbacks1 =
            1: { joypad: {}, zapper: {} }
            2: { joypad: {}, zapper: {} }
        @unbindCallbacks2 = keyboard: {}, mouse: {}

    initFPS: ->
        @fpsBuffer = (0 for [1..10])
        @fpsIndex = 0
        @fpsTime = 0

    initListeners: ->
        window.addEventListener "beforeunload", @saveData

    ###########################################################
    # Emulation
    ###########################################################

    start: ->
        @emuIntervalId = setInterval @step, 1000 / SCREEN_FPS

    stop: ->
        clearInterval @emuIntervalId
        @emuIntervalId = null

    isRunning: ->
        @emuIntervalId != null

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

    getFPS: ->
        (@fpsBuffer.reduce (a, b) -> a + b) / @fpsBuffer.length

    ###########################################################
    # Persistence
    ###########################################################

    setStorage: (storage) ->
        @nes.setStorage storage

    loadData: ->
        @nes.loadData()

    saveData: =>
        @nes.saveData()

    setPeriodicDataSave: (period) ->
        if period
            @saveIntervalId = setInterval @saveData, period
        else
            clearInterval @saveIntervalId

    ###########################################################
    # Video output
    ###########################################################

    renderFrame: ->
        @nes.renderFrame @frameBuffer.data

    drawFrame: ->
        @renderer.putImageData @frameBuffer, 0, 0
        @redrawScaledCanvas() if @canvasScale > 1

    getCanvasRect: =>
        @canvas.getBoundingClientRect()

    redrawScaledCanvas: ->
        @renderer.imageSmoothingEnabled = false
        @renderer.mozImageSmoothingEnabled = false
        @renderer.oImageSmoothingEnabled = false
        @renderer.webkitImageSmoothingEnabled = false
        @renderer.drawImage @canvas, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, 0, 0, @canvas.width, @canvas.height

    setVideoScale: (scale) ->
        @canvas.width = scale * SCREEN_WIDTH
        @canvas.height = scale * SCREEN_HEIGHT
        @canvasScale = scale
        @drawFrame()

    setVideoPalette: (palette = "default") ->
        palette = require "./paletts/#{capitalize palette}Palette" if typeof palette is "string"
        @nes.setVideoPalette palette

    setVideoDebug: (enabled) ->
        @nes.setVideoDebug enabled

    ###########################################################
    # Zapper light detection
    ###########################################################

    updateZapper: ->
        rect = @getCanvasRect()
        x = ~~((@binder.mouseX - rect.left) / @canvasScale)
        y = ~~((@binder.mouseY - rect.top - 1) / @canvasScale)
        x = 0 if x < 0 or x >= SCREEN_WIDTH
        y = 0 if y < 0 or y >= SCREEN_HEIGHT
        @inputDevices[1].zapper.setScreenPosition x, y
        @inputDevices[2].zapper.setScreenPosition x, y

    ###########################################################
    # Controls
    ###########################################################

    pressPower: ->
        @nes.pressPower()

    pressReset: ->
        @nes.pressReset()

    setInputDevice: (port, device) ->
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
        self = @
        element = document.getElementById element if typeof element is "string"
        element.addEventListener "change", (event) ->
            self.handleOpenedFile event, onLoad, onError

    enableFileDropping: (element, onLoad, onError) ->
        self = @
        element = document.getElementById element if typeof element is "string"
        element.addEventListener "dragover", (event) ->
            self.handleDraggedFile event
        element.addEventListener "drop", (event) ->
            self.handleDroppedFile event, onLoad, onError

    handleOpenedFile: (event, onLoad, onError) =>
        event.preventDefault()
        event.stopPropagation()
        file = event.target.files[0]
        @loadCartridge file, onLoad, onError if file

    handleDraggedFile: (event) ->
        event.preventDefault()
        event.stopPropagation()
        event.dataTransfer.dropEffect = "copy"

    handleDroppedFile: (event, onLoad, onError) =>
        event.preventDefault()
        event.stopPropagation()
        file = event.dataTransfer.files[0]
        @loadCartridge file, onLoad, onError if file

    loadCartridge: (file, onLoad, onError) ->
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
                onError?.call self, error, @status
            else
                onLoad?.call self, @response
        try
            request.send()
        catch error
            onError?.call self, error

    tryInsertCartridge: (arrayBuffer) ->
        try
            @insertCartridge arrayBuffer
        catch error
            return error

    insertCartridge: (arrayBuffer) ->
        @nes.saveData()
        cartridge = @cartridgeFactory.fromArrayBuffer arrayBuffer
        @nes.insertCartridge cartridge
        @nes.loadData()

    ###########################################################
    # Controls binding
    ###########################################################

    useDefaultControls: ->
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
        unbindInputDevice = @getUnbindInputDeviceCallback port, device, button, srcDevice, srcButton, unbindCallback
        useInputDevice = @getUseInputDeviceCallback port, device, button
        @unbindCallbacks1[port]?[device]?[button] = unbindInputDevice
        @unbindCallbacks2[srcDevice]?[srcButton] = unbindInputDevice
        @binder.bindControl srcDevice, srcButton, useInputDevice

    unbindInputDevice: (port, device, button, srcDevice, srcButton) ->
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
        @binder.recordInput callback
