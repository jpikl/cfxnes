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

    ###########################################################
    # Initialization
    ###########################################################

    constructor: (canvasID) ->
        @initCanvas canvasID
        @initConsole()
        @initControls()
        @pressPower()

    ###########################################################
    # Initialization
    ###########################################################

    initCanvas: (canvasID) ->
        @canvas = document.getElementById canvasID
        throw "No element with ID='#{canvasID}' exists." unless @canvas?
        @canvas.width = SCREEN_WIDTH
        @canvas.height = SCREEN_HEIGHT
        @clearCanvas()
        @imageData = @context.createImageData SCREEN_WIDTH, SCREEN_HEIGHT

    clearCanvas: ->
        @context = @canvas.getContext "2d"
        @context.rect(0, 0, SCREEN_WIDTH, SCREEN_WIDTH)
        @context.fillStyle = "black"
        @context.fill()

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
    # Inputs & controls
    ###########################################################

    pressPower: ->
        @nes.pressPower()

    pressReset: ->
        @nes.pressReset()

    insertCartridge: (url) ->
        cartridgeFactory = injector.getInstance "cartridgeFactory"
        # TODO

    connectInputDevice: (port, device) ->
        device = @inputDevices[port]?[device] or null
        @nes.connectInputDevice port, device

    ###########################################################
    # Controls binding
    ###########################################################

    bindControl: (port, device, button, srcDevice, srcButton, unbindCallback) ->
        binder = @binder

        @unbindCallbacks1[port]?[device]?[button]?()
        @unbindCallbacks1[port]?[device]?[button] = -> 
            binder.unbindControl srcDevice, srcButton
            unbindCallback()

        @unbindCallbacks2[srcDevice]?[srcButton]?()
        @unbindCallbacks2[srcDevice]?[srcButton] = ->
            binder.unbindControl srcDevice, srcButton
            unbindCallback()

        callback = @getInputDeviceCallback port, device, button
        @binder.bindControl srcDevice, srcButton, callback

    unbindControl: (port, device, button) ->
        @unbindCallbacks1[port]?[device]?[button]?()

    getInputDeviceCallback: (port, device, button) ->
        if device is "joypad"
            button = joypadButtonNameToId[button.toLowerCase()] or 0
            @inputDevices[port]?.joypad.setButtonPressed.bind this, button
        else if device is "zapper"
            @inputDevices[port]?.zapper.setTriggerPressed.bind this

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
        @imageData.data.set @nes.renderFrame()
        @context.putImageData @imageData, 0, 0

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
        r = @imageData.data[dataPosition]
        g = @imageData.data[dataPosition + 1]
        b = @imageData.data[dataPosition + 2]
        r > 32 and g > 32 and b > 32

window.NESCoffee = NESCoffee
