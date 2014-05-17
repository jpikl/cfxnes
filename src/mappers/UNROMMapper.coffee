AbstractMapper = require "./AbstractMapper"

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
        @mapPRGROMBank16K 0, 0x0000               # First 16K PRG ROM bank
        @mapPRGROMBank16K 1, @prgROMSize - 0x4000 # Last 16K PRG ROM bank
        @mapPRGRAMBank8K  0, 0x0000               # 8K PRG RAM
        @mapCHRRAMBank8K  0, 0x0000               # 8K CHR RAM

    write: (address, value) ->
        mask = if @prgROMSize <= 0x20000 then 0x07 else 0x0F # Check how many 16K PRG ROM banks we have (8/16).
        @mapPRGROMBank16K 0, (value & mask) * 0x4000         # Select lower 16K PRG ROM bank (0-7/0-15)

module.exports = UNROMMapper
