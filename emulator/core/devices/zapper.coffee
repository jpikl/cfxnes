###########################################################
# Zapper controller
###########################################################

class Zapper

    @dependencies: [ "ppu" ]

    inject: (ppu) ->
        @ppu = ppu

    constructor: ->
        @triggerPressed = 0
        @screenX = 0
        @screenY = 0

    strobe: ->

    read: ->
        @triggerPressed << 4 | !@isLightDetected() << 3

    isLightDetected: ->
        @screenX and @screenY and @ppu.isLightPixel @screenX, @screenY

    setTriggerPressed: (pressed) =>
        @triggerPressed = pressed

    setScreenPosition: (x, y) ->
        @screenX = x
        @screenY = y

module.exports = Zapper
