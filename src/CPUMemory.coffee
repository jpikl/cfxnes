###########################################################
# CPU memory
###########################################################

class CPUMemory

    @inject: [ "ppu", "apu" ]

    setMMC: (mmc) ->
        @mmc = mmc

    setInputDevice1: (device) ->
        @inputDevice1 = device

    setInputDevice2: (device) ->
        @inputDevice2 = device

    ###########################################################
    # Power-up state initialization
    ###########################################################

    powerUp: ->
        @resetRAM()
        @inputDeviceStrobe = 0

    resetRAM: ->
        @ram = (0 for [0...0x07FF])

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
        switch @getIOAddress address
            when 0x2002 then @ppu.readStatus()
            when 0x2004 then @ppu.readOAMData()
            when 0x2007 then @ppu.readData()
            when 0x4016 then readInputDevice1()
            when 0x4017 then readInputDevice2()
            else 0

    writeIO: (address, value) ->
        switch @getIOAddress address
            when 0x2000 then @ppu.writeControl value
            when 0x2001 then @ppu.writeMask value
            when 0x2003 then @ppu.writeOAMAddress value
            when 0x2004 then @ppu.writeOAMData value
            when 0x2005 then @ppu.writeScroll value
            when 0x2006 then @ppu.writeAddress value
            when 0x2007 then @ppu.writeData value
            when 0x4016 then @writeInputDevice value
            when 0x4017 then @writeInputDevice value
            else value

    getIOAddress: (address) ->
        if address < 0x4000 then address & 0x2007 else address # Mirroring of [$2000-$2008] in [$2000-$4000]

    ###########################################################
    # Input device reading / writing
    ###########################################################

    readInputDevice1: ->
        if @inputDevice1? then @inputDevice1.read() else 0

    readInputDevice2: ->
        if @inputDevice2? then @inputDevice2.read() else 0

    writeInputDevice: (value) ->
        strobe = value & 0x01
        if strobe and not @inputDeviceStrobe
            @inputDevice1?.strobe()
            @inputDevice2?.strobe()
        @inputDeviceStrobe = strobe
        value

    ###########################################################
    # MMC reading / writing
    ###########################################################

    readMMC: (address) ->
        @mmc?.cpuRead address

    writeMMC: (address, value) ->
        @mmc?.cpuWrite address, value

module.exports = CPUMemory
