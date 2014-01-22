NROMMapper = require "./NROMMapper"

###########################################################
# UNROM mapper
###########################################################

class CNROMMapper extends NROMMapper

    reset: ->
        @selectedVROMBank = 0

    ###########################################################
    # ROM writing
    ###########################################################

    writeROM: (address, value) ->
        @selectedVROMBank = value & 0x03

    ###########################################################
    # VROM reading
    ###########################################################

    getVROMBank: (address) ->
        @selectedVROMBank

module.exports = CNROMMapper
