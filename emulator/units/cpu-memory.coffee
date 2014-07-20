logger = require "../common/logger"

###########################################################
# CPU memory
###########################################################

class CPUMemory

    @inject: [ "ppu", "apu", "dma" ]

    inject: (ppu, apu, dma) ->
        @ppu = ppu
        @apu = apu
        @dma = dma

    constructor: ->
        @inputDevices = 1: null, 2: null

    ###########################################################
    # Power-up state initialization
    ###########################################################

    powerUp: ->
        logger.info "Reseting CPU memory"
        @createRAM()
        @resetIO()

    ###########################################################
    # CPU memory access
    ###########################################################

    read: (address) ->
        if      address >= 0x8000 then @$readPRGROM address # $8000-$FFFF
        else if address <  0x2000 then @$readRAM    address # $0000-$1FFF
        else if address <  0x4020 then @$readIO     address # $2000-$401F
        else if address >= 0x6000 then @$readPRGRAM address # $6000-$7FFF
        else                           @$readEXROM  address # $4020-$5FFF

    write: (address, value) ->
        if      address >= 0x8000 then @$writePRGROM address, value # $8000-$FFFF
        else if address <  0x2000 then @$writeRAM    address, value # $0000-$1FFF
        else if address <  0x4020 then @$writeIO     address, value # $2000-$401F
        else if address >= 0x6000 then @$writePRGRAM address, value # $6000-$7FFF
        else                           @$writeEXROM  address, value # $4020-$5FFF

    ###########################################################
    # RAM acceess ($0000-$1FFF)
    ###########################################################

    createRAM: ->
        @ram = (0 for [0...0x07FF]) # 2KB of RAM (mirrored in 8K at $0000-$1FFF)
        undefined

    readRAM: (address) ->
        @ram[@$mapRAMAddress address]

    writeRAM: (address, value) ->
        @ram[@$mapRAMAddress address] = value

    mapRAMAddress: (address) ->
        address & 0x07FF # Mirroring of [$0000-$07FFF] in [$0000-$1FFF]

    ###########################################################
    # IO acceess ($2000-$401F)
    ###########################################################

    resetIO: ->
        @inputDevicesStrobe = 0

    readIO: (address) ->
        switch @$mapIOAddress address
            when 0x2002 then @ppu.readStatus()
            when 0x2004 then @ppu.readOAMData()
            when 0x2007 then @ppu.readData()
            when 0x4016 then @readInputDevice 1
            when 0x4017 then @readInputDevice 2
            else 0

    writeIO: (address, value) ->
        switch @$mapIOAddress address
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

    mapIOAddress: (address) ->
        if address < 0x4000 then address & 0x2007 else address # Mirroring of [$2000-$2007] in [$2000-$3FFF]

    ###########################################################
    # Input devices acceess ($4000-$401F)
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
    # EX ROM acceess ($4020-$5FFF)
    ###########################################################

    readEXROM: (address) ->
        0 # Not supported yet

    writeEXROM: (address, value) ->
        value # Not supported yet

    ###########################################################
    # PRG RAM acceess ($6000-$7FFF)
    ###########################################################

    resetPRGRAM: (mapper) ->
        @prgRAM = mapper.prgRAM
        @prgRAMMapping = null

    readPRGRAM: (address) ->
        if @prgRAM
            @prgRAM[@$mapPRGRAMAddress address]
        else
            0

    writePRGRAM: (address, value) ->
        if @prgRAM
            @prgRAM[@$mapPRGRAMAddress address] = value
        else
            value

    mapPRGRAMAddress: (address) ->
        @prgRAMMapping | address & 0x1FFF

    mapPRGRAMBank: (srcBank, dstBank) ->
        @prgRAMMapping = dstBank * 0x2000 # Only one 8K bank

    ###########################################################
    # PRG ROM acceess ($8000-$FFFF)
    ###########################################################

    resetPRGROM: (mapper) ->
        @writeMapper = mapper.write.bind mapper
        @prgROM = mapper.prgROM
        @prgROMMapping = []

    readPRGROM: (address) ->
        @prgROM[@$mapPRGROMAddress address]

    writePRGROM: (address, value) ->
        @writeMapper address, value # Writing to mapper registers

    mapPRGROMAddress: (address) ->
        @prgROMMapping[address & 0x6000] | address & 0x1FFF

    mapPRGROMBank: (srcBank, dstBank) ->
        @prgROMMapping[srcBank * 0x2000] = dstBank * 0x2000 # 8K bank

    ###########################################################
    # Mapper connection
    ###########################################################

    connectMapper: (mapper) ->
        mapper.cpuMemory = this
        @resetPRGROM mapper
        @resetPRGRAM mapper

module.exports = CPUMemory
