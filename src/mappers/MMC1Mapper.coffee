AbstractMapper = require "./AbstractMapper"

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
            when 0x8000 then @controllRegister = @shiftRegister # $8000-$9FFF (100X)
            when 0xA000 then @chrBankRegister1 = @shiftRegister # $A000-$BFFF (101X)
            when 0xC000 then @chrBankRegister2 = @shiftRegister # $C000-$DFFF (110X)
            when 0xE000 then @prgBankRegister = @shiftRegister  # $E000-$FFFF (111X)

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
            when 0 then @setSingleScreenMirroring 0
            when 1 then @setSingleScreenMirroring 1
            when 2 then @setVerticalMirroring()
            when 3 then @setHorizontalMirroring()

    switchPRGROMBanks: ->
        base = @chrBankRegister1 & 0x10  # Selection of 256K page on 512K PRG ROM
        offset = @prgBankRegister & 0x0F # 16K bank selection within 256K page
        switch @controllRegister & 0x0C
            when 0x0C
                @mapPRGROMBank16K 0, base | offset # Selected 16K PRG ROM bank
                @mapPRGROMBank16K 1, base | 0x0F   # Last 16K PRG ROM bank
            when 0x08
                @mapPRGROMBank16K 0, base          # First 16K PRG ROM bank
                @mapPRGROMBank16K 1, base | offset # Selected 16K PRG ROM bank
            else
                @mapPRGROMBank32K 0, base | offset >>> 1 # Selected 32K PRG ROM

    switchPRGRAMBank: ->
        @mapPRGRAMBank8K 0, @chrBankRegister1 >>> 2 # Selected 8K PRG RAM bank

    switchCHRROMBanks: ->
        if @controllRegister & 0x10
            @mapCHRROMBank4K 0, @chrBankRegister1 # Selected lower 4K CHR ROM bank
            @mapCHRROMBank4K 1, @chrBankRegister2 # Selected upper 4K CHR ROM bank
        else
            @mapCHRROMBank8K 0, @chrBankRegister1 >>> 1  # Selected 8K CHR ROM bank

    switchCHRRAMBanks: ->
        if @controllRegister & 0x10
            @mapCHRRAMBank4K 0, @chrBankRegister1 # Selected lower 4K CHR RAM bank
            @mapCHRRAMBank4K 1, @chrBankRegister2 # Selected upper 4K CHR RAM bank
        else
            @mapCHRRAMBank8K 0, 0 # Whole 8K CHR RAM

module.exports = MMC1Mapper
