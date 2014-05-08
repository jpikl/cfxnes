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
        @romPageSelect1 = 0  # Selects 256K ROM page (bit 0)
        @romPageSelect2 = 0  # Selects 256K ROM page (bit 1)
        @romBankSelect = 0   # Selects lower/upper 16K ROM bank within a 256K page
        @vromBankSelect1 = 0 # Selects lower 4K ROM bank
        @vromBankSelect2 = 0 # Selects upper 4K ROM bank

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
        pageBase = @getROMPage(controll) * 0x100000 # Base address of one of 256K pages (for 512K and 1024K roms)
        if controll & 0x08
            if controll & 0x04
                @lowerROMBankBase = pageBase + @romBankSelect * 0x4000 # Selected 16K ROM bank
                @upperROMBankBase = pageBase + 0x0F * 0x4000           # Last 16K ROM bank from 256K
            else
                @lowerROMBankBase = pageBase                           # First 16K ROM bank
                @upperROMBankBase = pageBase + @romBankSelect * 0x4000 # Selected 16K ROM bank
        else
            @lowerROMBankBase = pageBase + (@romBankSelect & 0x0E) * 0x4000 # Selected 32K ROM bank (first part)
            @upperROMBankBase = @lowerROMBankBase + 0x4000                  # Selected 32K ROM bank (second part)

    getROMPage: (controll) ->
        if @rom.length <= 0x100000
            0                                 # First (and only one) 256K page on 256K ROM
        else if @rom.length <= 0x200000
            @romPageSelect1                   # First or second 256K page on 512K ROM
        else if controll & 0x10
            @romPageSelect2 | @romPageSelect1 # One of four 256K pages on 1024K ROM
        else
            @romPageSelect1 << 1              # First or third 256K page on 1024K ROM

    switchVROMBank: (controll) ->
        if controll & 0x10
            @lowerVROMBankBase = @vromBankSelect1 * 0x1000 # Select 4K VROM bank
            @upperVROMBankBase = @vromBankSelect2 * 0x1000 # Select 4K VROM bank
        else
            @lowerVROMBankBase = (@vromBankSelect1 & 0x0E) * 0x1000 # Select 8K VROM bank (first part)
            @upperVROMBankBase = @lowerVROMBankBase + 0x1000        # Select 8K VROM bank (second part)

    writeVROMBank1Register: (value) ->
        @vromBankSelect1 = value & 0x0F
        @romPageSelect1 = (value & 0x10) >> 4

    writeVROMBank2Register: (value) ->
        @vromBankSelect2 = value & 0x0F
        @romPageSelect2 = (value & 0x10) >> 3

    writeROMBankRegister: (value) ->
        @romBankSelect = value & 0x0F

    ###########################################################
    # ROM reading
    ###########################################################

    readROM: (address) ->
        @rom[@$getROMBase(address) | @$getROMOffset(address)]

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
        @rom[@$getVROMBase(address) | @$getVROMOffset(address)]

    getVROMBase: (address) ->
        if address < 0x1000
            @lowerVROMBankBase
        else
            @upperVROMBankBase

    getVROMOffset: (address) ->
        address & 0x0FFF

module.exports = MMC1Mapper
