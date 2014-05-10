AbstractMapper = require "./AbstractMapper"
Types          = require "../Types"

Mirroring = Types.Mirroring

###########################################################
# MMC1 mapper
###########################################################

class MMC1Mapper extends AbstractMapper

    ###########################################################
    # MMC initialization
    ###########################################################

    resetMapper: ->
        @resetShiftRegister()
        @resetBankRegisters()
        @synchronizeMapper()

    resetShiftRegister: ->
        @shiftRegister = 0 # 5-bit (shifts to right, writes are to bit 4)
        @writesCount = 0   # Counts 5 writes to fill shift register.

    resetBankRegisters: ->
        @controllRegister = 0x0C # 5-bit - mapper configuration
        @romBankRegister = 0     # 5-bit - selects lower/upper 16K ROM bank within a 256K page
        @vromBankRegister1 = 0   # 5-bit - selects lower 4K ROM bank
        @vromBankRegister2 = 0   # 5-bit - selects upper 4K ROM bank

    ###########################################################
    # MMC writing
    ###########################################################

    writeMapper: (address, value) ->
        if value & 0x80
            @resetShiftRegister()
            @controllRegister = @controllRegister | 0x0C
        else
            @shiftRegister = @shiftRegister | (value & 1) << @writesCount
            if ++@writesCount >= 5
                @copyShiftRegister address
                @resetShiftRegister()
                @synchronizeMapper()
        value

    copyShiftRegister: (address) ->
        switch address & 0xE000
            when 0x8000 then @controllRegister = @shiftRegister  # $8000-$9FFF (100X)
            when 0xA000 then @vromBankRegister1 = @shiftRegister # $A000-$BFFF (101X)
            when 0xC000 then @vromBankRegister2 = @shiftRegister # $C000-$DFFF (110X)
            when 0xE000 then @romBankRegister = @shiftRegister   # $E000-$FFFF (111X)

    ###########################################################
    # MMC reconfiguration
    ###########################################################

    synchronizeMapper: ->
        @switchMirroring()
        @switchVROMBanks()
        @switchROMBanks()

     switchMirroring: ->
        switch @controllRegister & 0x03
            when 0 then @setMirroring Mirroring.SINGLE_SCREEN_1
            when 1 then @setMirroring Mirroring.SINGLE_SCREEN_2
            when 2 then @setMirroring Mirroring.VERTICAL
            when 3 then @setMirroring Mirroring.HORIZONTAL

    switchROMBanks: ->
        pageBase = @getROMPage() * 0x100000                        # Base address of one of 256K pages (for 512K and 1024K roms)
        @lowerROMBankBase = pageBase + @getLowerROMBank() * 0x4000 # 16K $8000-$BFFF (default first ROM bank in 256k)
        @upperROMBankBase = pageBase + @getUpperROMBank() * 0x4000 # 16K $C000-$FFFF (default last ROM bank in 256k)

    getROMPage: ->
        if @rom.length <= 0x40000
            0                                  # First (and only one) 256K page on 256K ROM
        else if @rom.length <= 0x80000
            (@vromBankRegister1 & 0x10) >>> 4   # First or second 256K page on 512K ROM
        else if @controllRegister & 0x10
            (@vromBankRegister2 & 0x10) >>> 3 | # One of four 256K pages on 1024K ROM
            (@vromBankRegister1 & 0x10) >>> 4
        else
            (@vromBankRegister1 & 0x10) >>> 3   # First or third 256K page on 1024K ROM

    getLowerROMBank: ->
        switch (@controllRegister & 0x0C) >>> 2
            when 3 then @romBankRegister & 0x0F # Selected 16K ROM bank
            when 2 then 0                       # First 16K ROM bank
            else        @romBankRegister & 0x0E # Selected 32K ROM bank (first half)

    getUpperROMBank: ->
        switch (@controllRegister & 0x0C) >>> 2
            when 3 then (@rom.length >>> 14) - 1      # Last 16K ROM bank
            when 2 then @romBankRegister & 0x0F       # Selected 16K ROM bank
            else        (@romBankRegister & 0x0E) + 1 # Selected 32K ROM bank (second half)

    switchVROMBanks: ->
        @lowerVROMBankBase = @getLowerVROMBank() * 0x1000 # 4K $0000-$0FFF
        @upperVROMBankBase = @getUpperVROMBank() * 0x1000 # 4K $1000-$1FFF

    getLowerVROMBank: ->
        if @controllRegister & 0x10
            (@vromBankRegister1 & 0x1F) # Selected 4K VROM bank
        else
            (@vromBankRegister1 & 0x1E) # Selected 8K VROM bank (first half)

    getUpperVROMBank: ->
        if @controllRegister & 0x10
            (@vromBankRegister2 & 0x1F)     # Selected 4K VROM bank
        else
            (@vromBankRegister1 & 0x1E) + 1 # Selected 8K VROM bank (second half)

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
        @vrom[@$getVROMBase(address) | @$getVROMOffset(address)]

    getVROMBase: (address) ->
        if address < 0x1000
            @lowerVROMBankBase
        else
            @upperVROMBankBase

    getVROMOffset: (address) ->
        address & 0x0FFF

module.exports = MMC1Mapper
