AbstractMapper = require "./AbstractMapper"

###########################################################
# NROM mapper
###########################################################

class NROMMapper extends AbstractMapper

    ###########################################################
    # ROM reading
    ###########################################################

    resetROM: ->
        # Check if we have 16KB or 32KB ROM
        if @rom.length <= 0x4000
            @romMask = 0x3FFF
        else
            @romMask = 0x7FFF

    readROM: (address) ->
        @rom[address & @romMask]

module.exports = NROMMapper
