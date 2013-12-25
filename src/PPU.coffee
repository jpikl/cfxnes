class PPU

    @inject: [ "ppuMemory", "cpu" ]

    constructor: ->
        @spriteRAM = (0 for [0..0x100]) # 256B

    tick: ->

module.exports = PPU
