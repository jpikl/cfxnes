Injector = require "./utils/Injector"
Joypad   = require "./controllers/Joypad"
Zapper   = require "./controllers/Zapper"
Binder   = require "./Binder"

SCREEN_FPS    = 60.0988
SCREEN_WIDTH  = 256
SCREEN_HEIGHT = 240

joypadButtonNameToId =
    "a":      Joypad.BUTTON_A
    "b":      Joypad.BUTTON_B
    "select": Joypad.BUTTON_SELECT
    "start":  Joypad.BUTTON_START
    "up":     Joypad.BUTTON_UP
    "down":   Joypad.BUTTON_DOWN
    "left":   Joypad.BUTTON_LEFT
    "right":  Joypad.BUTTON_RIGHT

class NESCoffee

    constructor: (@canvas) ->
        throw "Canvas element or its ID was not specified." unless @canvas?
        @initCanvas()
        @initRenderer()
        @initFramebuffer()
        @initConsole()
        @initControls()
        @pressPower()

    ###########################################################
    # Initialization
    ###########################################################

    initCanvas: ->
        @canvas.width = SCREEN_WIDTH
        @canvas.height = SCREEN_HEIGHT

    initRenderer: ->
        @renderer = @canvas.getContext "2d"
        @renderer.rect(0, 0, SCREEN_WIDTH, SCREEN_WIDTH)
        @renderer.fillStyle = "black"
        @renderer.fill()

    initFramebuffer: ->
        @framebuffer = @renderer.createImageData SCREEN_WIDTH, SCREEN_HEIGHT

    initConsole: ->
        injector = new Injector "./config/BaseConfig"
        @nes = injector.getInstance "nes"
        @inputDevices =
            1: { joypad: new Joypad, zapper: new Zapper }
            2: { joypad: new Joypad, zapper: new Zapper }

    initControls: ->
        @binder = new Binder
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
        cartridgeFactory = injector.getInstance "cartridgeFactory"
        cartridge = cartridgeFactory.fromArrayBuffer arrayBuffer
        @nes.insertCartridge arrayBuffer

    connectInputDevice: (port, device) ->
        device = @inputDevices[port]?[device] or null
        @nes.connectInputDevice port, device

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
        @unbindCallbacks1[port]?[device]?[button]?()
        @unbindCallbacks1[port]?[device]?[button] = callback
        @unbindCallbacks2[srcDevice]?[srcButton]?()
        @unbindCallbacks2[srcDevice]?[srcButton] = callback

    getInputDeviceCallback: (port, device, button) ->
        if device is "joypad"
            button = joypadButtonNameToId[button.toLowerCase()] or 0
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
    # Emulation main loop
    ###########################################################

    startEmulation: ->
        @intervalID = setInterval @emulationStep, 1000 / SCREEN_FPS

    stopEmulation: ->
        clearInterval @intervalID
        @intervalID = null

    emulationStep: =>
        @drawFrame()
        @updateZapper()

    drawFrame: ->
        @framebuffer.data.set @nes.renderFrame()
        @renderer.putImageData @framebuffer, 0, 0

    updateZapper: ->
        lightDetected = @isMousePointingOnLightPixel()
        @inputDevices[1].zapper.setLightDetected lightDetected
        @inputDevices[2].zapper.setLightDetected lightDetected

    isMousePointingOnLightPixel: ->
        rect = @canvas.getBoundingClientRect()
        x = ~~(@binder.mouseX - rect.left)
        y = ~~(@binder.mouseY - rect.top)
        return false if x < 0 or x >= SCREEN_WIDTH or y < 0 or y >= SCREEN_HEIGHT
        dataPosition = y * SCREEN_HEIGHT + x
        r = @framebuffer.data[dataPosition]
        g = @framebuffer.data[dataPosition + 1]
        b = @framebuffer.data[dataPosition + 2]
        r > 32 and g > 32 and b > 32

window.NESCoffee = NESCoffee
