AbstractMapper = require "./abstract-mapper"

###########################################################
# AOROM mapper
###########################################################

class AOROM extends AbstractMapper

    ###########################################################
    # Mapper initialization / writing
    ###########################################################

    init: (cartridge) ->
        super cartridge
        @hasPRGRAM = false

    reset: ->
        @mapPRGROMBank32K 0, 0 # First 32K PRG ROM bank
        @mapCHRRAMBank8K  0, 0 # 8K CHR RAM

    write: (address, value) ->
        @mapPRGROMBank32K 0, value                     # Select 32K PRG ROM bank
        @setSingleScreenMirroring (value & 0x10) >>> 4 # Select single screen mirroring area

module.exports = AOROM
