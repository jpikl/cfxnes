NROMMapper = require "./NROMMapper"

###########################################################
# UNROM mapper
###########################################################

class CNROMMapper extends NROMMapper

    ###########################################################
    # ROM writing
    ###########################################################

    writeROM: (address, value) ->
        @vromBank = @vromBanks[value & 0x03]
        value

module.exports = CNROMMapper
