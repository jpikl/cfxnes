###########################################################
# PPU memory
###########################################################

class PPUMemory

    setMMC: (mmc) ->
        @mmc = mmc

    read: (address) ->
        @mmc.ppuRead @getVRAMOffset address

    write: (address, value) ->
        @mmc.ppuWrite @getVRAMOffset address, value

    getVRAMOffset: (address) ->
        address & 0x3FFF # Mirroring of [$0000-$3FFF] in [$0000-$FFFF]

module.exports = PPUMemory
