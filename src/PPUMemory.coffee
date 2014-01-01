###########################################################
# PPU memory
###########################################################

class PPUMemory

    setMMC: (mmc) ->
        @mmc = mmc

    ###########################################################
    # Power-up state initialization
    ###########################################################

    powerUp: ->

    ###########################################################
    # MMC reading / writing
    ###########################################################

    read: (address) ->
        @mmc.ppuRead @getVRAMAddress address

    write: (address, value) ->
        @mmc.ppuWrite @getVRAMAddress address, value

    getVRAMAddress: (address) ->
        address & 0x3FFF # Mirroring of [$0000-$3FFF] in [$0000-$FFFF]

module.exports = PPUMemory
