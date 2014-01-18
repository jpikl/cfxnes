Injector = require "./utils/Injector"
Joypad   = require "./controllers/Joypad"
Binder   = require "./Binder"

SCREEN_FPS    = 60.0988
SCREEN_WIDTH  = 256
SCREEN_HEIGHT = 240

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

    constructor: (@canvas) ->
        throw "Canvas element or its ID was not specified." unless @canvas?
        @initCanvas()
        @initRenderer()
        @initFramebuffer()
        @initConsole()
        @initControls()
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
        @framebuffer = @renderer.createImageData SCREEN_WIDTH, SCREEN_HEIGHT
        for i in [0...@framebuffer.data.length]
            @framebuffer.data[i] = if (i & 0x03) != 0x03 then 0x00 else 0xFF # RGBA = 000000FF

    initConsole: ->
        @injector = new Injector "./config/BaseConfig"
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
        device = @inputDevices[port]?[device] or null
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
        @unbindCallbacks1[port]?[device]?[button] = callback
        @unbindCallbacks2[srcDevice]?[srcButton]?()
        @unbindCallbacks2[srcDevice]?[srcButton] = callback

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
        previousEmulationTime = @emulationTime or 0
        @emulationTime = +new Date
        @emulationFPS = 1000 / (@emulationTime - previousEmulationTime)

    getFPS: ->
        @emulationFPS

    ###########################################################
    # Video output
    ###########################################################

    renderFrame: ->
        srcBuffer = @nes.renderFrame()
        dstBuffer = @framebuffer.data
        if dstBuffer.set
            dstBuffer.set srcBuffer
        else
            dstBuffer[i] = value for value, i in srcBuffer # Because of Internet Explorer
        undefined

    drawFrame: ->
        @renderer.putImageData @framebuffer, 0, 0
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
