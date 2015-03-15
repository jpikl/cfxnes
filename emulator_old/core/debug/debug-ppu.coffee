PPU = require "../units/ppu"



###########################################################
# CPU with disabled rendering
###########################################################

class DebugPPU extends PPU

    powerUp: ->
        super()
        @setRGBAPalette new Uint32Array 64
        @startFrame new Array 1

    tick: ->
        @framePosition = 0
        super()

module.exports = DebugPPU
