PPU = require "../units/ppu"

###########################################################
# CPU with disabled rendering
###########################################################

class DebugPPU extends PPU

    clearFramePixel: ->
    setFramePixel: ->
    updateRGBAPalette: ->

module.exports = DebugPPU
