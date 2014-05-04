AbstractMapper = require "./AbstractMapper"
Types          = require "../Types"

Mirroring = Types.Mirroring

###########################################################
# MMC1 mapper
###########################################################

class MMC1Mapper extends AbstractMapper

    ###########################################################
    # MMC registers initialization
    ###########################################################

    resetMapper: ->
        @resetShiftRegister()
        @resetBankRegisters()
        @resetVariables()

    resetShiftRegister: ->
        @shiftRegister = 0 # 5-bit (shifts to right, writes are to bit 4)
        @writesCount = 0   # Counts 5 writes to fill shift register.

    resetBankRegisters: ->
        @romBankRegister = 0x0   # 5-bit
        @vromBank1Register = 0x0 # 5-bit
        @vromBank1Register = 0x0 # 5-bit

    resetVariables: ->
        @lowerROMBankBase = 0x0000         # 16K $8000-$BFFF (default first ROM bank in 256k)
        @upperROMBankBase = 0x0F * 0x4000  # 16K $C000-$FFFF (default last ROM bank in 256k)
        @lowerVROMBankBase = 0x0000        #  4K $0000-$0FFF
        @upperVROMBankBase = 0x0000        #  4K $1000-$1FFF

    ###########################################################
    # MMC registers writing
    ###########################################################

    writeMapper: (address, value) ->
        if value & 0x80
            @resetShiftRegister() # Bit 7 is on
        else
            @shiftRegister = (value & 1) << 4 | @shiftRegister >>> 1
            @copyShiftRegister address if ++@writesCount >= 5
        value

    copyShiftRegister: (address) ->
        targetSelect = address & 0xE000
        if targetSelect == 0x8000
            @writeControllRegister @shiftRegister  # 5-bit $8000-$9FFF (100X)
        else if targetSelect == 0xA000
            @writeVROMBank1Register @shiftRegister # 5-bit $A000-$BFFF (101X)
        else if targetSelect == 0xC000
            @writeVROMBank2Register @shiftRegister # 5-bit $C000-$DFFF (110X)
        else if targetSelect == 0xE000
            @writeROMBankRegister @shiftRegister   # 5-bit $E000-$FFFF (111X)
        @resetShiftRegister()

    writeControllRegister: (value) ->
        @switchMirroring value
        @switchROMBank value
        @switchVROMBank value

    switchMirroring: (controll) ->
        if controll & 0x02
            if controll & 0x01
                @setMirroring Mirroring.HORIZONTAL
            else
                @setMirroring Mirroring.VERTICAL
        else
            @setMirroring Mirroring.SINGLE_SCREEN

    switchROMBank: (controll) ->
        pageBase = @getROMPageBase controll # Base address of one of 256K pages (for 512K and 1024K roms)
        if controll & 0x08
            if controll & 0x04
                @lowerROMBankBase = pageBase + @romBankRegister * 0x4000 # Selected 16K ROM bank
                @upperROMBankBase = pageBase + 0x0F * 0x4000             # Last ROM bank in 256k
            else
                @lowerROMBankBase = pageBase                             # First ROM bank in 256k
                @upperROMBankBase = pageBase + @romBankRegister * 0x4000 # Selected 16K ROM bank
        else
            @lowerROMBankBase = pageBase + (@romBankRegister & 0x1E) * 0x4000 # Selected 32K ROM bank (first part)
            @upperROMBankBase = @lowerROMBankBase + 0x4000                    # Selected 32K ROM bank (second part)

    getROMPageBase: (controll) ->
        if @rom.length <= 0x100000
            @getROMPageBaseFor256K()
        else if @rom.length <= 0x200000
            @getROMPageBaseFor512K()
        else
            @getROMPageBaseFor1024K controll

    getROMPageBaseFor256K: ->
        0x0000 # First (and only one) 256K page

    getROMPageBaseFor512K: ->
        selector = @vromBank1Register & 0x10
        selector << 16 # First or second 256K page

    getROMPageBaseFor1024K: (controll) ->
        selector1 =  @vromBank1Register & 0x10
        selector2 = (@vromBank2Register & 0x10) << 1
        if controll & 0x10
            (select2 | select1) << 16  # Selection from all four 256K pages
        else
            selector1 << 17            # First or third 256K page

    switchVROMBank: (controll) ->
        if controll & 0x10
            @lowerVROMBankBase = @vromBank1Register * 0x1000 # Select 4K VROM bank
            @upperVROMBankBase = @vromBank2Register * 0x1000 # Select 4K VROM bank
        else
            @lowerVROMBankBase = (@vromBank1Register & 0x1E) * 0x1000 # Select 8K VROM bank (first part)
            @upperVROMBankBase = @lowerVROMBankBase + 0x1000          # Select 8K VROM bank (second part)

    writeVROMBank1Register: (value) ->
        @vromBank1Register = value & 0x01F

    writeVROMBank2Register: (value) ->
        @vromBank2Register = value  & 0x01F

    writeROMBankRegister: (value) ->
        @romBankRegister = value & 0x01F

    ###########################################################
    # ROM reading
    ###########################################################

    readROM: (address) ->
        @rom[(@$getROMBase address) | (@$getROMOffset address)]

    getROMBase: (address) ->
        if address < 0xC000
            @lowerROMBankBase
        else
            @upperROMBankBase

    getROMOffset: (address) ->
        address & 0x3FFF

    ###########################################################
    # VROM reading
    ###########################################################

    readVROM: (address) ->
        @rom[(@$getVROMBase address) | (@$getVROMOffset address)]

    getVROMBase: (address) ->
        if address < 0x1000
            @lowerVROMBankBase
        else
            @upperVROMBankBase

    getVROMOffset: (address) ->
        address & 0x0FFF

module.exports = MMC1Mapper
