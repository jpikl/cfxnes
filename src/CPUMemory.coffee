###########################################################
# CPU memory
###########################################################

class CPUMemory

    @inject: [ "ppu", "apu", "dma" ]

    constructor: ->
        @inputDevices = 1: null, 2: null
  
    ###########################################################
    # Power-up state initialization
    ###########################################################

    powerUp: ->
        @resetRAM()
        @inputDevicesStrobe = 0

    resetRAM: ->
        @ram = (0 for [0...0x07FF])

    ###########################################################
    # Generic reading / writing
    ###########################################################

    read: (address) ->
        if      address < 0x2000 then @_readRAM address
        else if address < 0x4020 then @_readIO  address
        else                          @_readMMC address

    write: (address, value) ->
        if      address < 0x2000 then @_writeRAM address, value
        else if address < 0x4020 then @_writeIO  address, value
        else                          @_writeMMC address, value

    ###########################################################
    # RAM acceess
    ###########################################################

    readRAM: (address) ->
        @ram[@_getRAMOffset address]

    writeRAM: (address, value) ->
        @ram[@_getRAMOffset address] = value

    getRAMOffset: (address) ->
        address & 0x07FF # Mirroring of [$0000-$0800] in [$0000-$2000]

    ###########################################################
    # IO registers acceess
    ###########################################################

    readIO: (address) ->
        switch @_getIOAddress address
            when 0x2002 then @ppu.readStatus()
            when 0x2004 then @ppu.readOAMData()
            when 0x2007 then @ppu.readData()
            when 0x4016 then @readInputDevice 1
            when 0x4017 then @readInputDevice 2
            else 0

    writeIO: (address, value) ->
        switch @_getIOAddress address
            when 0x2000 then @ppu.writeControl value
            when 0x2001 then @ppu.writeMask value
            when 0x2003 then @ppu.writeOAMAddress value
            when 0x2004 then @ppu.writeOAMData value
            when 0x2005 then @ppu.writeScroll value
            when 0x2006 then @ppu.writeAddress value
            when 0x2007 then @ppu.writeData value
            when 0x4014 then @dma.writeAddress value
            when 0x4016 then @writeInputDevice value
            when 0x4017 then @writeInputDevice value
            else value

    getIOAddress: (address) ->
        if address < 0x4000 then address & 0x2007 else address # Mirroring of [$2000-$2008] in [$2000-$4000]

    ###########################################################
    # Input devices acceess
    ###########################################################

    setInputDevice: (port, device) ->
        @inputDevices[port] = device

    getInputDevice: (port) ->
        @inputDevices[port]

    readInputDevice: (port) ->
        @inputDevices[port]?.read() or 0

    writeInputDevice: (value) ->
        strobe = value & 1
        if strobe and not @inputDevicesStrobe
            @inputDevices[1]?.strobe()
            @inputDevices[2]?.strobe()
        @inputDevicesStrobe = strobe
        value

    ###########################################################
    # MMC acceess
    ###########################################################

    setMMC: (mmc) ->
        @mmc = mmc

    readMMC: (address) ->
        @mmc?.cpuRead address

    writeMMC: (address, value) ->
        @mmc?.cpuWrite address, value

module.exports = CPUMemory
