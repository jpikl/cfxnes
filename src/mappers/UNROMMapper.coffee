AbstractMapper = require "./AbstractMapper"

###########################################################
# UNROM mapper
###########################################################

class UNROMMapper extends AbstractMapper

    ###########################################################
    # MMC writng
    ###########################################################

    resetMapper: ->
        @lowerROMBankBase = 0x0000               # First 16KB ROM bank
        @upperROMBankBase = @rom.length - 0x4000 # Last 16KB ROM bank

    writeMapper: (address, value) ->
        mask = if @rom.length <= 0x20000 then 0x07 else 0x0F # Check how many 16KB ROM banks are there (8/16).
        @lowerROMBankBase = (value & mask) * 0x4000          # Select lower 16KB ROM bank (0..7 / 0..15)
        value

    ###########################################################
    # ROM reading
    ###########################################################

    readROM: (address) ->
        @rom[(@$getROMBase address) | (@$getROMOffset address)]

    getROMBase: (address) ->
        if address < 0xC000
            @lowerROMBankBase
        else
            @upperROMBankBase

    getROMOffset: (address) ->
        address & 0x3FFF

module.exports = UNROMMapper
