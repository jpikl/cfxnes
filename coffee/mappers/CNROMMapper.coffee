AbstractMapper = require "./AbstractMapper"

###########################################################
# UNROM mapper
###########################################################

class CNROMMapper extends AbstractMapper

    ###########################################################
    # Mapper initialization / writing
    ###########################################################

    init: (cartridge) ->
        super cartridge
        @hasPRGRAM = false

    reset: ->
        @mapPRGROMBank16K 0,  0 # First 16K PRG ROM bank
        @mapPRGROMBank16K 1, -1 # Last 16K PRG ROM bank (or mirror of the first one)
        @mapCHRROMBank8K  0,  0 # First 8K CHR ROM bank

    write: (address, value) ->
        @mapCHRROMBank8K 0 , value # Select 8K CHR ROM bank

module.exports = CNROMMapper
