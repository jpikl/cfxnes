Types = require "../Types"
Format =  require "../utils/Format"

wordAsHex = Format.wordAsHex
Mirroring = Types.Mirroring

###########################################################
# Base class for ROM mappers
###########################################################

class AbstractMapper

    constructor: (cartridge) ->
        @rom = cartridge.rom    # Also known as PRG ROM
        @vrom = cartridge.vrom  # Also known as CHR ROM
        @sram = cartridge.sram  # Also known as PRG RAM
        @vramEnabled = cartridge.hasVRAM
        @sramEnabled = cartridge.hasSRAM
        @setMirroring cartridge.mirroring
        @reset()

    ###########################################################
    # Power-up state initialization
    ###########################################################

    powerUp: ->
        @reset()

    reset: ->
        @resetMapper()
        @resetVRAM()

    resetMapper: ->
        # For mappers to implement.

    resetVRAM: ->
        @vram = (0 for [0...0x4000]) # Also known as CHR RAM (max. 16KB of VRAM, not all is used).

    ###########################################################
    # CPU reading / writing
    ###########################################################

    cpuRead: (address) ->
        if      address >= 0x8000 then @readROM address
        else if address >= 0x6000 then @readSRAM address
        else if address >= 0x4020 then @readEXRAM address
        else    throw "Illegal state (CPU is trying to read from 0x#{wordAsHex address} using MMC)."

    cpuWrite: (address, value) ->
        if      address >= 0x8000 then @writeMapper address, value
        else if address >= 0x6000 then @writeSRAM address, value
        else if address >= 0x4020 then @writeEXRAM address, value
        else    throw "Illegal state (CPU is trying to write to 0x#{wordAsHex address} using MMC)."

    ###########################################################
    # ROM reading / writing
    ###########################################################

    readROM: (address) ->
        throw "Mapper does not implement ROM reading!"

    writeMapper: (address, value) ->
         value # Read-only by default

    ###########################################################
    # SRAM reading / writing
    ###########################################################

    readSRAM: (address) ->
        if @sramEnabled
            @sram[@$getSRAMOffset address]
        else
            0

    writeSRAM: (address, value) ->
        if @sramEnabled
            @sram[@$getSRAMOffset address] = value
        else
            value

    getSRAMOffset: (address) ->
        address & 0x1FFF

    ###########################################################
    # Expansion RAM reading / writing
    ###########################################################

    readEXRAM: (address) ->
        0

    writeEXRAM: (address, value) ->
        value

    ###########################################################
    # PPU reading / writing
    ###########################################################

    ppuRead: (address) ->
        if      address >= 0x3F00 then @$readPallete address
        else if address >= 0x2000 then @$readNamesTable address
        else                           @$readPatternsTable address

    ppuWrite: (address, value) ->
        if      address >= 0x3F00 then @$writePallete address, value
        else if address >= 0x2000 then @$writeNamesTable address, value
        else                           @$writePatternsTable address, value

    ###########################################################
    # Pallete reading / writing
    ###########################################################

    readPallete: (address) ->
        @vram[@$getPalleteAddress address]

    writePallete: (address, value) ->
        @vram[@$getPalleteAddress address] = value

    getPalleteAddress: (address) ->
        if (address & 0x0003)
            address & 0x3F1F # Mirroring of [$3F00-$3F1F] in [$3F00-$3FFF]
        else
            address & 0x3F0F # $3F10/$3F14/$3F18/$3F1C are mirrorors of $3F00/$3F04/$3F08$/3F0C.

    ###########################################################
    # Names & attributes table reading / writing
    ###########################################################

    readNamesTable: (address) ->
        @vram[@$getNamesTableAddress address]

    writeNamesTable: (address, value) ->
        @vram[@$getNamesTableAddress address] = value

    getNamesTableAddress: (address) ->
        # Subarea [$2000-$2EFF] of [$2000-$2FFF] is mirrored in [$3000-$3EFF]
        @mirroringTable[address & 0x2C00] | (address & 0x03FF)

    setMirroring: (mirroring) ->
        # Mirroring of areas [A|B|C|D] in [$2000-$2FFF]
        switch mirroring
            when Mirroring.SINGLE_SCREEN_1 then @setMirroringAreas 0x2000, 0x2000, 0x2000, 0x2000 # [1|1|1|1]
            when Mirroring.SINGLE_SCREEN_2 then @setMirroringAreas 0x2400, 0x2400, 0x2400, 0x2400 # [2|2|2|2]
            when Mirroring.HORIZONTAL      then @setMirroringAreas 0x2000, 0x2000, 0x2400, 0x2400 # [1|1|2|2]
            when Mirroring.VERTICAL        then @setMirroringAreas 0x2000, 0x2400, 0x2000, 0x2400 # [1|2|1|2]
            when Mirroring.FOUR_SCREEN     then @setMirroringAreas 0x2000, 0x2400, 0x2800, 0x2C00 # [1|2|3|4]

    setMirroringAreas: (area1, area2, area3, area4) ->
        @mirroringTable = @mirroringTable or []
        @mirroringTable[0x2000] = area1
        @mirroringTable[0x2400] = area2
        @mirroringTable[0x2800] = area3
        @mirroringTable[0x2C00] = area4

    ###########################################################
    # Patterns table reading / writing
    ###########################################################

    readPatternsTable: (address) ->
        if @vramEnabled
            @vram[address]
        else
            @readVROM address

    writePatternsTable: (address, value) ->
        if @vramEnabled
            @vram[address] = value
        else
            @writeVROM address, value

    ###########################################################
    # VROM reading / writing
    ###########################################################

    readVROM: (address) ->
        @vrom[address]

    writeVROM: (address, value) ->
         value # Read-only

module.exports = AbstractMapper
