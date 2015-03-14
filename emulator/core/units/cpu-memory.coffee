logger = require("../utils/logger").get()
system = require "../utils/system"

###########################################################
# CPU memory
###########################################################

class CPUMemory

    @dependencies: [ "ppu", "apu", "dma" ]

    init: (ppu, apu, dma) ->
        @ppu = ppu
        @apu = apu
        @dma = dma
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
        @ram = system.allocateBytes 0x800 # 2KB of RAM (mirrored in 8K at $0000-$1FFF)
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
            when 0x4015 then @apu.readStatus()
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
            when 0x4000 then @apu.writePulseDutyEnvelope 1, value
            when 0x4001 then @apu.writePulseSweep 1, value
            when 0x4002 then @apu.writePulseTimer 1, value
            when 0x4003 then @apu.writePulseLengthCounter 1, value
            when 0x4004 then @apu.writePulseDutyEnvelope 2, value
            when 0x4005 then @apu.writePulseSweep 2, value
            when 0x4006 then @apu.writePulseTimer 2, value
            when 0x4007 then @apu.writePulseLengthCounter 2, value
            when 0x4008 then @apu.writeTriangleLinearCounter value
            when 0x400A then @apu.writeTriangleTimer value
            when 0x400B then @apu.writeTriangleLengthCounter value
            when 0x400C then @apu.writeNoiseEnvelope value
            when 0x400E then @apu.writeNoiseTimer value
            when 0x400F then @apu.writeNoiseLengthCounter value
            when 0x4010 then @apu.writeDMCFlagsTimer value
            when 0x4011 then @apu.writeDMCOutputLevel value
            when 0x4012 then @apu.writeDMCSampleAddress value
            when 0x4013 then @apu.writeDMCSampleLength value
            when 0x4015 then @apu.writeStatus value
            when 0x4017
                @apu.writeFrameCounter value
                @writeInputDevice value
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
        @resetPRGROM mapper
        @resetPRGRAM mapper

module.exports = CPUMemory
