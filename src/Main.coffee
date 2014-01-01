Injector = require "./utils/Injector"
Joypad   = require "./controllers/Joypad"
Zapper   = require "./controllers/Zapper"

FPS = 60

injector = new Injector "./config/BaseConfig"

nes = injector.getInstance "nes"
nes.pressPower()

devices1 = joypad: new Joypad, zapper: new Zapper
devices2 = joypad: new Joypad, zapper: new Zapper

###########################################################
# Keyboard events
###########################################################

keyboardMapping = 
    88: devices1.joypad.setButtonPressed.bind this, Joypad.BUTTON_A      # X
    89: devices1.joypad.setButtonPressed.bind this, Joypad.BUTTON_B      # Y
    90: devices1.joypad.setButtonPressed.bind this, Joypad.BUTTON_B      # Z
    16: devices1.joypad.setButtonPressed.bind this, Joypad.BUTTON_SELECT # Shift
    13: devices1.joypad.setButtonPressed.bind this, Joypad.BUTTON_START  # Enter
    38: devices1.joypad.setButtonPressed.bind this, Joypad.BUTTON_UP     # Up
    40: devices1.joypad.setButtonPressed.bind this, Joypad.BUTTON_DOWN   # Down
    37: devices1.joypad.setButtonPressed.bind this, Joypad.BUTTON_LEFT   # Left
    39: devices1.joypad.setButtonPressed.bind this, Joypad.BUTTON_RIGHT  # Right

processKeyEvent = (event, keyDown) ->
    event or= window.event
    keyCode = event.keyCode or event.which
    callback = keyboardMapping[keyCode]
    callback keyDown if callback?

document.onkeydown = (event) ->
    processKeyEvent event, true

document.onkeyup = (event) ->
    processKeyEvent event, false

###########################################################
# Mouse events
###########################################################

mouseMapping =
    1: devices2.zapper.setTriggerPressed # Left button

processMouseEvent = (event, buttonDown) ->
    event or= window.event
    button = event.button or event.which
    callback = mouseMapping[button]
    callback buttonDown if callback?

window.onmousedown = (event) ->
    processMouseEvent event, true

window.onmouseup = (event) ->
    processMouseEvent event, false

mouseX = 0
mouseY = 0

window.onmousemove = (event) ->
    event or= window.event
    mouseX = event.clientX
    mouseY = event.clientY

###########################################################
# Main loop
###########################################################

window.onload = ->
    canvas = document.getElementById "screen"
    context = canvas.getContext "2d"
    imageData = context.createImageData 256, 240

    drawFrame = ->
        imageData.data.set nes.renderFrame()
        context.putImageData imageData, 0, 0

    isMousePointingOnLightPixel = ->
        rect = canvas.getBoundingClientRect()
        x = ~~(mouseX - rect.left)
        y = ~~(mouseY - rect.top)
        return false if x < 0 or x >= 256 or y < 0 or y >= 240
        dataPosition = y * 240 + x
        r = imageData.data[dataPosition]
        g = imageData.data[dataPosition + 1]
        b = imageData.data[dataPosition + 2]
        r > 32 and g > 32 and b > 32

    updateZapper = ->
        lightDetected = isMousePointingOnLightPixel()
        devices2["zapper"].setLightDetected lightDetected

    emulationStep = ->
        drawFrame()
        updateZapper()

    setInterval emulationStep, 1000 / FPS

###########################################################
# Public API
###########################################################

window.NESCoffee =

    pressPower: ->
        nes.pressPower()

    pressReset: ->
        nes.pressReset()

    insertCartridge: (url) ->
        cartridgeFactory = injector.getInstance "cartridgeFactory"
        # TODO

    setInputDevice1: (name) ->
        nes.setInputDevice1 devices1[name] or null

    setInputDevice2: (name) ->
        nes.setInputDevice2 devices2[name] or null
