Types = require "../Types"
Format =  require "../utils/Format"

wordAsHex = Format.wordAsHex
Mirroring = Types.Mirroring

###########################################################
# Basic ROM mapper
###########################################################

class NROMMapper

    constructor: (@cartridge) ->

    ###########################################################
    # Power-up state initialization
    ###########################################################

    powerUp: ->
        @resetVRAM()

    resetVRAM: ->
        @vram = (0 for [0...0x4000]) # Max. 16KB of VRAM (not all is used).

    ###########################################################
    # CPU reading / writing
    ###########################################################

    cpuRead: (address) ->
        switch
            when address >= 0x8000 then @readROM address 
            when address >= 0x6000 then @readSRAM address
            when address >= 0x4020 then @readEXRAM address
            else throw "Illegal state (CPU is trying to read from 0x#{wordAsHex address} using MMC)."

    cpuWrite: (address, value) ->
        switch
            when address >= 0x8000 then value # Read-only
            when address >= 0x6000 then @writeSRAM address, value
            when address >= 0x4020 then @writeEXRAM address, value
            else throw "Illegal state (CPU is trying to write to 0x#{wordAsHex address} using MMC)."

    ###########################################################
    # ROM reading
    ###########################################################

    readROM: (address) ->
        @cartridge.romBanks[@getROMBank address][@getROMOffset address]

    getROMBank: (address) ->
        if address < 0xC000 or @cartridge.romBanks.length == 1 then 0 else 1

    getROMOffset: (address) ->
        address & 0x3FFF

    ###########################################################
    # SRAM reading / writing
    ###########################################################

    readSRAM: (address) ->
        if @cartridge.hasSRAM
            @cartridge.sramBanks[@getSRAMBank address][@getSRAMOffset address]
        else
            0

    writeSRAM: (address, value) ->
        if @cartridge.hasSRAM
            @cartridge.sramBanks[@getSRAMBank address][@getSRAMOffset address] = value
        else
            value

    getSRAMBank: (address) ->
        0

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
        switch
            when address >= 0x3F00 then @readPallete address
            when address >= 0x2000 then @readNamesTable address
            else                        @readPatternsTable address

    ppuWrite: (address, value) ->
        switch
            when address >= 0x3F00 then @writePallete address, value
            when address >= 0x2000 then @writeNamesTable address, value
            else                        @writePatternsTable address, value

    ###########################################################
    # Pallete reading / writing
    ###########################################################

    readPallete: (address) ->
        @vram[@getPalleteAddress address]

    writePallete: (address, value) ->
        @vram[@getPalleteAddress address] = value

    getPalleteAddress: (address) ->
        address &= 0x3F1F                                   # Mirroring of [$3F00-$3F1F] in [$3F00-$3FFF]
        if (address & 0x0003) == 0 then 0x3F00 else address # $3F00, $3F04, ..., $3F1C share the same value

    ###########################################################
    # Names & attributes table reading / writing
    ###########################################################

    readNamesTable: (address) ->
        @vram[@getNamesTableAddress address]

    writeNamesTable: (address, value) ->
        @vram[@getNamesTableAddress address] = value

    getNamesTableAddress: (address) ->
        # Area [$2000-$2EFF] from [$2EFF-$2FFF] is mirrored in [$3000-$3EFF]
        switch getMirroring()
            when Mirroring.SINGLE_SCREEN then (address & 0x23FF)                            # [1|1|1|1] in [$2000-$2FFF]
            when Mirroring.HORIZONTAL    then (address & 0x23FF) | (address & 0x0800) >>> 1 # [1|1|2|2] in [$2000-$2FFF]
            when Mirroring.VERTICAL      then (address & 0x27FF)                            # [1|2|1|2] in [$2000-$2FFF]
            when Mirroring.FOUR_SCREEN   then (address & 0x2FFF)                            # [1|2|3|4] in [$2000-$2FFF]

    getMirroring: ->
        @cartridge.mirroring

    ###########################################################
    # Patterns table reading / writing
    ###########################################################

    readPatternsTable: (address) ->
        if @cartridge.hasVRAM
            @vram[address]
        else
            @readVROM address

    writePatternsTable: (address, value) ->
        if @cartridge.hasVRAM
            @vram[address] = value
        else
            value # Read-only

    ###########################################################
    # VROM reading
    ###########################################################

    readVROM: (address) ->
        @cartridge.vromBanks[@getVROMBank address][address]

    getVROMBank: (address) ->
        0

module.exports = NROMMapper
