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
        @mapPRGROMBank16K 0,  0 # First 16K PRG ROM bank
        @mapPRGROMBank16K 1, -1 # Last 16K PRG ROM bank
        @mapCHRROMBank8K  0,  0 # 8K CHR ROM

module.exports = NROMMapper
