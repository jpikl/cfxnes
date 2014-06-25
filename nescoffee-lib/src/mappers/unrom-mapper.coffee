AbstractMapper = require "./abstract-mapper"

###########################################################
# UNROM mapper
###########################################################

class UNROMMapper extends AbstractMapper

    ###########################################################
    # Mapper initialization / writng
    ###########################################################

    init: (cartridge) ->
        super cartridge
        @hasPRGRAM = true
        @prgRAMSize = 0x2000 # 8K PRG RAM

    reset: ->
        @mapPRGROMBank16K 0,  0 # First 16K PRG ROM bank
        @mapPRGROMBank16K 1, -1 # Last 16K PRG ROM bank
        @mapPRGRAMBank8K  0,  0 # 8K PRG RAM
        @mapCHRRAMBank8K  0,  0 # 8K CHR RAM

    write: (address, value) ->
        @mapPRGROMBank16K 0, value # Select lower 16K PRG ROM bank

module.exports = UNROMMapper
