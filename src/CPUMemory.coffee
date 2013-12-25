###########################################################
# CPU memory
###########################################################

class CPUMemory

    constructor: (@ppu) ->
        @ram = (0 for [0...0x07FF])

    setMMC: (mmc) ->
        @mmc = mmc

    ###########################################################
    # Generic reading / writing
    ###########################################################

    read: (address) ->
        switch
            when address < 0x2000 then @readRAM address
            when address < 0x4020 then @readIO  address
            else                       @readMMC address

    write: (address, value) ->
        switch
            when address < 0x2000 then @writeRAM address, value
            when address < 0x4020 then @writeIO  address, value
            else                       @writeMMC address, value

    ###########################################################
    # RAM reading / writing
    ###########################################################

    readRAM: (address) ->
        @ram[@getRAMOffset address]

    writeRAM: (address, value) ->
        @ram[@getRAMOffset address] = value

    getRAMOffset: (address) ->
        address & 0x07FF # Mirroring of [$0000-$0800] in [$0000-$2000]

    ###########################################################
    # IO registers reading / writing
    ###########################################################

    readIO: (address) ->
        address = @getIOAddress address
        0 # TODO implement

    writeIO: (address, value) ->
        address = @getIOAddress address
        value # TODO implement

    getIOAddress: (address) ->
        if address < 0x4000 then address & 0x2007 else address # Mirroring of [$2000-$2008] in [$2000-$4000]

    ###########################################################
    # MMC reading / writing
    ###########################################################

    readMMC: (address) ->
        @mmc?.cpuRead address

    writeMMC: (address, value) ->
        @mmc?.cpuWrite address, value

module.exports = CPUMemory
