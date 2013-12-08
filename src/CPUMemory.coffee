            
###########################################################
# CPU memory
###########################################################

class CPUMemory

    constructor(@ppu): ->
        @ram = 0 for [0...0x07FF]

    setCartridge: (cartridge)
        @cartridge = cartridge

    read: (address) ->
        switch address
            when address < 0x2000 then @readRAM address
            when address < 0x4020 then @readIORegister address
            else                       @readCartridge address

    write: (address, value) ->
        switch address
            when address < 0x2000 then @writeRAM address, value
            when address < 0x4020 then @writeIORegister address, value
            else                       @writeCartridge address, value

    readRAM: (address) ->
        @ram[@getRAMAddress address]

    writeRAM: (address, value) ->
        @ram[@getRAMAddress address] = value

    getRAMAddress: (address) ->
        address & 0x07FF # Mirroring of [0...0x0800] in [0...0x2000]

    readIORegister: (address) ->
        address = @getIORegisterAddress address
        # TODO implement

    writeIORegister: (address, value) ->
        address = @getIORegisterAddress address
        # TODO implement

    getIORegisterAddress: (address) ->
        # Mirroring of [0x2000...0x2008] in [0x2000...0x4000]
        if address < 0x4000 then address & 0x2007 else address

    readCartridge: (address) ->
        @cartridge.read address

    writeCartridge: (address) ->
        @cartridge.write address, value

module.exports = CPUMemory
