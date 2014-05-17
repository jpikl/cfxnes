AbstractMapper = require "./AbstractMapper"

###########################################################
# NROM mapper
###########################################################

class NROMMapper extends AbstractMapper

    ###########################################################
    # Mapper initialization
    ###########################################################

    init: (cartridge) ->
        super cartridge
        @hasPRGRAM = false

    reset: ->
        @mapPRGROMBank16K 0, 0x0000               # First 16K PRG ROM bank
        @mapPRGROMBank16K 1, @prgROMSize - 0x4000 # Last 16K PRG ROM bank (or mirror of the first one)
        @mapCHRROMBank8K  0, 0x0000               # 8K CHR ROM

module.exports = NROMMapper
