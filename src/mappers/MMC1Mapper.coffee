AbstractMapper = require "./AbstractMapper"
Types          = require "../Types"

Mirroring = Types.Mirroring

###########################################################
# MMC1 mapper
###########################################################

class MMC1Mapper extends AbstractMapper

    ###########################################################
    # Mapper initialization
    ###########################################################

    init: (cartridge) ->
        super cartridge
        @hasPRGRAM = true    # Depends on board, so we presume PRG RAM is present
        @prgRAMSize = 0x8000 # Depends on board, the largest value is 32K on SXROM

    reset: ->
        @resetShiftRegister()
        @resetBankRegisters()
        @synchronizeMapper()

    resetShiftRegister: ->
        @shiftRegister = 0 # 5-bit (shifts to right, writes are to bit 4)
        @writesCount = 0   # Counts 5 writes to fill shift register.

    resetBankRegisters: ->
        @controllRegister = 0x0C # 5-bit - mapper configuration
        @prgBankRegister = 0     # 5-bit - selects lower/upper 16K PRG ROM bank within a 256K page
        @chrBankRegister1 = 0    # 5-bit - selects lower 4K CHR ROM bank
        @chrBankRegister2 = 0    # 5-bit - selects upper 4K CHR ROM bank

    ###########################################################
    # Mapper writing
    ###########################################################

    write: (address, value) ->
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
            when 0xA000 then @chrBankRegister1 = @shiftRegister # $A000-$BFFF (101X)
            when 0xC000 then @chrBankRegister2 = @shiftRegister # $C000-$DFFF (110X)
            when 0xE000 then @prgBankRegister = @shiftRegister   # $E000-$FFFF (111X)

    ###########################################################
    # Mapper reconfiguration
    ###########################################################

    synchronizeMapper: ->
        @switchMirroring()
        @switchPRGROMBanks()
        @switchPRGRAMBank() if @hasPRGRAM
        @switchCHRROMBanks() unless @hasCHRRAM
        @switchCHRRAMBanks() if @hasCHRRAM

    switchMirroring: ->
        switch @controllRegister & 0x03
            when 0 then @setMirroring Mirroring.SINGLE_SCREEN_1
            when 1 then @setMirroring Mirroring.SINGLE_SCREEN_2
            when 2 then @setMirroring Mirroring.VERTICAL
            when 3 then @setMirroring Mirroring.HORIZONTAL

    switchPRGROMBanks: ->
        base = if @prgROMSize >= 0x80000 and @chrBankRegister1 & 0x10
            0x40000 # Second 256K area on 512K ROM
        else
            0       # First 256K area on 512K ROM
        switch @controllRegister & 0x0C
            when 0x0C
                @mapPRGROMBank16K 0, base + (@prgBankRegister & 0x0F) * 0x4000      # Selected 16K PRG ROM bank
                @mapPRGROMBank16K 1, base + Math.min(0x3C000, @prgROMSize - 0x4000) # Last 16K PRG ROM bank
            when 0x08
                @mapPRGROMBank16K 0, base + 0x0000                                  # First 16K PRG ROM bank
                @mapPRGROMBank16K 1, base + (@prgBankRegister & 0x0F) * 0x4000      # Selected 16K PRG ROM bank
            else
                @mapPRGROMBank32K 0, base + (@prgBankRegister & 0x0E) * 0x4000      # Selected 32K PRG ROM bank

    switchPRGRAMBank: ->
        @mapPRGRAMBank8K 0, (@chrBankRegister1 & 0x0C) * 0x0800 # Selected 8K PRG RAM bank

    switchCHRROMBanks: ->
        if @controllRegister & 0x10
            @mapCHRROMBank4K 0, (@chrBankRegister1 & 0x1F) * 0x1000  # Selected lower 4K CHR ROM bank
            @mapCHRROMBank4K 1, (@chrBankRegister2 & 0x1F) * 0x1000  # Selected upper 4K CHR ROM bank
        else
            @mapCHRROMBank8K 0, (@chrBankRegister1 & 0x1E) * 0x1000  # Selected 8K CHR ROM bank

    switchCHRRAMBanks: ->
        if @controllRegister & 0x10
            @mapCHRRAMBank4K 0, (@chrBankRegister1 & 0x01) * 0x1000 # Selected lower 4K CHR RAM bank
            @mapCHRRAMBank4K 1, (@chrBankRegister2 & 0x01) * 0x1000 # Selected upper 4K CHR RAM bank
        else
            @mapCHRRAMBank8K 0, 0x0000 # Whole 8K CHR RAM

module.exports = MMC1Mapper
