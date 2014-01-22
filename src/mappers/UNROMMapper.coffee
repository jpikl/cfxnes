NROMMapper = require "./NROMMapper"

###########################################################
# UNROM mapper
###########################################################

class UNROMMapper extends NROMMapper

    reset: ->
        @selectedROMBank = 0

    ###########################################################
    # ROM reading / writing
    ###########################################################

    writeROM: (address, value) ->
        mask = if @romBanks.length > 8 then 0x0F else 0x07
        @selectedROMBank = value & mask

    getROMBank: (address) ->
        if address < 0xC000 then @selectedROMBank else @romBanks.length - 1

module.exports = UNROMMapper
