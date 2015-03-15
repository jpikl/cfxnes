###########################################################
# Zapper device
###########################################################

class Zapper

    @dependencies: [ "ppu" ]

    init: (ppu) ->
        @ppu = ppu
        @triggerPressed = 0
        @beamX = 0
        @beamY = 0

    strobe: ->

    read: ->
        @triggerPressed << 4 | !@isLightDetected() << 3

    isLightDetected: ->
        @beamX and @beamY and @ppu.isBrightFramePixel @beamX, @beamY

    setTriggerPressed: (pressed) =>
        @triggerPressed = pressed

    setBeamPosition: (x, y) ->
        @beamX = x
        @beamY = y

module.exports = Zapper
