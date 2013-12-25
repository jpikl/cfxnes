Util = require "../utils/Util"

wordAsHex = Util.wordAsHex

###########################################################
# Basic ROM mapper
###########################################################

class NROMMapper

    constructor: (@cartridge) ->

    ###########################################################
    # CPU reading / writing
    ###########################################################

    cpuRead: (address) ->
        switch
            when address >= 0x8000 then @readROM address 
            when address >= 0x6000 then @readSRAM address
            when address >= 0x4020 then @readExpansionROM address
            else throw "Illegal state (CPU is trying to read from 0x#{wordAsHex address} using MMC)."

    cpuWrite: (address, value) ->
        switch
            when address >= 0x8000 then @writeROM address, value
            when address >= 0x6000 then @writeSRAM address, value
            when address >= 0x4020 then @writeExpansionROM address, value
            else throw "Illegal state (CPU is trying to write to 0x#{wordAsHex address} using MMC)."

    ###########################################################
    # ROM reading / writing
    ###########################################################

    readROM: (address) ->
        @cartridge.ROMBanks[@getROMBank address][@getROMOffset address]

    writeROM: (address, value) ->
        @cartridge.ROMBanks[@getROMBank address][@getROMOffset address] = value

    getROMBank: (address) ->
        if address < 0xC000 or @cartridge.ROMBanks.length == 1 then 0 else 1

    getROMOffset: (address) ->
        address & 0x3FFF

    ###########################################################
    # SRAM reading / writing
    ###########################################################

    readSRAM: (address) ->
        if @cartridge.hasSRAM
            @cartridge.SRAMBanks[@getSRAMBank address][@getSRAMOffset address]
        else
            0

    writeSRAM: (address, value) ->
        if @cartridge.hasSRAM
            @cartridge.SRAMBanks[@getSRAMBank address][@getSRAMOffset address] = value
        else
            0

    getSRAMBank: (address) ->
        0

    getSRAMOffset: (address) ->
        address & 0x1FFF

    ###########################################################
    # Expansion ROM reading / writing
    ###########################################################

    readExpansionROM: ->
        0

    writeExpansionROM: ->
        0

module.exports = NROMMapper
