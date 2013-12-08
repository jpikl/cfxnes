class NROMMapper

    read: (cartridge, address) ->
        if address >= 0x8000 
            @readPRGROM cartridge, address 
        else 
            0

    write: (cartridge, address, value) ->
        if address >= 0x8000
            @writePRGROM cartridge, address

    readPRGROM: (cartridge, address) ->
        bank = @getPRGROMBank cartridge, address
        bank[@getPRGROMOffset address]

    writePRGROM: (cartridge, address, value) ->
        bank = @getPRGROMBank cartridge, address
        bank[@getPRGROMOffset address] = value

    getPRGROMBank: (cartridge, address) ->
        banksCount = cartridge.PRGROMBanks.length
        bankIndex = if address < 0xC000 or banksCount == 1 then 0 else 1
        cartridge.PRGROMBanks[bankIndex]

    getPRGROMOffset: (address) ->
        address & 0x7FFF

module.exports = NROMMapper
