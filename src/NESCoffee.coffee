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
        @setVideoPalette()
        @pressPower()
        @drawFrame()

    ###########################################################
    # Initialization
    ###########################################################

    initCanvas: ->
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

    ###########################################################
    # Inputs
    ###########################################################

    pressPower: ->
        @nes.pressPower()

    pressReset: ->
        @nes.pressReset()

    insertCartridge: (arrayBuffer) ->
        cartridge = @cartridgeFactory.fromArrayBuffer arrayBuffer
        @nes.insertCartridge cartridge

    setInputDevice: (port, device) ->
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

    bindControl: (port, device, button, srcDevice, srcButton, unbindCallback) ->
        binder = @binder
        @replaceUnbindCallback port, device, button, srcDevice, srcButton, ->
            binder.unbindControl srcDevice, srcButton
            unbindCallback()
        callback = @getInputDeviceCallback port, device, button
        @binder.bindControl srcDevice, srcButton, callback

    replaceUnbindCallback: (port, device, button, srcDevice, srcButton, callback) ->
        unbindCallbacks1 = @unbindCallbacks1
        unbindCallbacks2 = @unbindCallbacks2
        unbindCallbacks1[port]?[device]?[button]?()
        unbindCallbacks1[port]?[device]?[button] = ->
            unbindCallbacks2[srcDevice]?[srcButton] = null
            callback()
        unbindCallbacks2[srcDevice]?[srcButton]?()
        unbindCallbacks2[srcDevice]?[srcButton] = ->
            unbindCallbacks1[port]?[device]?[button] = null
            callback()

    getInputDeviceCallback: (port, device, button) ->
        if device is "joypad"
            button = joypadButtonToId[button.toLowerCase()] or 0
            @inputDevices[port]?.joypad.setButtonPressed.bind this, button
        else if device is "zapper"
            @inputDevices[port]?.zapper.setTriggerPressed.bind this

    unbindControl: (port, device, button) ->
        @unbindCallbacks1[port]?[device]?[button]?()
        @unbindCallbacks1[port]?[device]?[button] = null

    ###########################################################
    # Input recording
    ###########################################################

    recordInput: (callback) ->
        @binder.recordInput callback

    ###########################################################
    # Emulation
    ###########################################################

    start: ->
        @intervalID = setInterval @step, 1000 / SCREEN_FPS

    stop: ->
        clearInterval @intervalID
        @intervalID = null

    isRunning: ->
        @intervalID != null

    step: =>
        @renderFrame()
        @drawFrame()
        @updateZapper()
        @computeFPS()

    computeFPS: ->
        timeNow = Date.now()
        @fpsBuffer[@fpsIndex] = 1000 / (timeNow - @fpsTime)
        @fpsIndex = (@fpsIndex + 1) % @fpsBuffer.length
        @fpsTime = timeNow

    getFPS: ->
        (@fpsBuffer.reduce (a, b) -> a + b) / @fpsBuffer.length

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
