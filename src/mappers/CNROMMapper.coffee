NROMMapper = require "./NROMMapper"

###########################################################
# UNROM mapper
###########################################################

class CNROMMapper extends NROMMapper

    ###########################################################
    # ROM writing
    ###########################################################

    writeROM: (address, value) ->
        @vromBankBase = (value & 0x03) * 0x2000 # Select 8KB VROM bank (0..7)
        value

    ###########################################################
    # VROM reading
    ###########################################################

    resetVROM: ->
        @vromBankBase = 0

    readVROM: (address) ->
        @vrom[@vromBankBase | address]

module.exports = CNROMMapper
