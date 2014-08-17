Joypad = require "../../../core/devices/Joypad"

joypadButtonAliases =
    "a":      Joypad.Button.A
    "b":      Joypad.Button.B
    "select": Joypad.Button.SELECT
    "start":  Joypad.Button.START
    "up":     Joypad.Button.UP
    "down":   Joypad.Button.DOWN
    "left":   Joypad.Button.LEFT
    "right":  Joypad.Button.RIGHT

###########################################################
# Adapter for joypad device
###########################################################

class JoypadAdapter

    constructor: ->
        @joypad = new Joypad

    getAdaptee: ->
        @joypad

    inputChanged: (input, down) ->
        button = joypadButtonAliases[input]
        @joypad.setButtonPressed button, down if button

module.exports = JoypadAdapter
