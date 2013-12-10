class NROMMapper

    constructor: (@cartridge) ->

    cpuRead: (address) ->
        if address >= 0x8000 
            @readROM address 
        else 
            0

    cpuWrite: (address, value) ->
        if address >= 0x8000
            @writeROM address

    readROM: (address) ->
        bank = @getROMBank address
        bank[@getROMOffset address]

    writeROM: (address, value) ->
        bank = @getROMBank address
        bank[@getROMOffset address] = value

    getROMBank: (address) ->
        banksCount = @cartridge.ROMBanks.length
        bankIndex = if address < 0xC000 or banksCount == 1 then 0 else 1
        @cartridge.ROMBanks[bankIndex]

    getROMOffset: (address) ->
        address & 0x7FFF

module.exports = NROMMapper
