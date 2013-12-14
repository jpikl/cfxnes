###########################################################
# CPU memory
###########################################################

class CPUMemory

    constructor: (@ppu) ->
        @ram = 0 for [0...0x07FF]

    setMMC: (mmc) ->
        @mmc = mmc

    ###########################################################
    # Generic reading / writing
    ###########################################################

    read: (address) ->
        switch address
            when address < 0x2000 then @readRAM address
            when address < 0x4020 then @readIO  address
            else                       @readMMC address

    write: (address, value) ->
        switch address
            when address < 0x2000 then @writeRAM address, value
            when address < 0x4020 then @writeIO  address, value
            else                       @writeMMC address, value

    ###########################################################
    # RAM reading / writing
    ###########################################################

    readRAM: (address) ->
        @ram[@getRAMAddress address]

    writeRAM: (address, value) ->
        @ram[@getRAMAddress address] = value

    getRAMAddress: (address) ->
        address & 0x07FF # Mirroring of [0...0x0800] in [0...0x2000]

    ###########################################################
    # IO registers reading / writing
    ###########################################################

    readIO: (address) ->
        address = @getIOAddress address
        # TODO implement

    writeIO: (address, value) ->
        address = @getIOAddress address
        # TODO implement

    getIOAddress: (address) ->
        # Mirroring of [0x2000...0x2008] in [0x2000...0x4000]
        if address < 0x4000 then address & 0x2007 else address

    ###########################################################
    # MMC reading / writing
    ###########################################################

    readMMC: (address) ->
        @mmc.cpuRead address if @mmc?

    writeMMC: (address, value) ->
        @mmc.cpuWrite address, value if @mmc?

module.exports = CPUMemory
