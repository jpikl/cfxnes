NROMMapper = require "./NROMMapper"

###########################################################
# UNROM mapper
###########################################################

class UNROMMapper extends NROMMapper

    ###########################################################
    # ROM reading / writing
    ###########################################################

    writeROM: (address, value) ->
        mask = if @romBanks.length > 8 then 0x0F else 0x07
        @lowerROMBank = @romBanks[value & mask]
        value

module.exports = UNROMMapper
