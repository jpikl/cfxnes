NROMMapper = require "./NROMMapper"

###########################################################
# UNROM mapper
###########################################################

class CNROMMapper extends NROMMapper

    ###########################################################
    # Mapper initialization / writing
    ###########################################################

    init: (cartridge) ->
        super cartridge
        @hasPRGRAM = false

    reset: ->
        @mapPRGROMBank16K 0, 0x0000               # First 16K PRG ROM bank
        @mapPRGROMBank16K 1, @prgROMSize - 0x4000 # Last 16K PRG ROM bank (or mirror of the first one)
        @mapCHRROMBank8K  0, 0x0000               # First 8K CHR ROM bank

    write: (address, value) ->
        @mapCHRROMBank8K 0 , (value & 0x03) * 0x2000 # Select 8K CHR ROM bank (0-7)

module.exports = CNROMMapper
