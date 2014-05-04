NROMMapper = require "./NROMMapper"

###########################################################
# UNROM mapper
###########################################################

class CNROMMapper extends NROMMapper

    ###########################################################
    # MMC registers writing
    ###########################################################

    resetMapper: ->
        super()
        @vromBase = 0

    writeMapper: (address, value) ->
        @vromBase = (value & 0x03) * 0x2000 # Select 8KB VROM bank (0..7)
        value

    ###########################################################
    # VROM reading
    ###########################################################

    readVROM: (address) ->
        @vrom[@vromBase | address]

module.exports = CNROMMapper
