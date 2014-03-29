AbstractMapper = require "./AbstractMapper"

###########################################################
# NROM mapper
###########################################################

class NROMMapper extends AbstractMapper

    ###########################################################
    # ROM reading
    ###########################################################

    resetROM: ->
        @mirrorLowerROMBank = @rom.length <= 0x4000 # Check if we have 16KB or 32KB ROM

    readROM: (address) ->
        @rom[@$getROMOffset address]

    getROMOffset: (address) ->
        if @mirrorLowerROMBank
            address & 0x3FFF 
        else
            address & 0x7FFF 

module.exports = NROMMapper
