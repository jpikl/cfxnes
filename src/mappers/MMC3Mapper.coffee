AbstractMapper = require "./AbstractMapper"

###########################################################
# MMC3 mapper
###########################################################

class MMC3 extends AbstractMapper

    ###########################################################
    # Mapper initialization
    ###########################################################

    init: (cartridge) ->
        super cartridge
        @hasPRGRAM = true

    reset: ->
        @resetMapping()
        @resetRegisters()

    resetMapping: ->
        @mapPRGROMBank32K 0, -1                   # Last 32K PRG ROM bank
        @mapPRGRAMBank8K  0,  0                   # 8K PRG RAM
        @mapCHRROMBank8K  0,  0 unless @hasCHRRAM # First 8K CHR ROM bank (if it is present)
        @mapCHRRAMBank8K  0,  0 if     @hasCHRRAM # 8K CHR RAM (if CHR ROM is not present)

    resetRegisters: ->
        @bankCommand = 0 # Bank command
        @bankSelect = 0  # Bank selection
        @irqLatch = 0    # Initial IRQ counter value
        @irqCounter = 0  # IRQ counter value
        @irqEnabled = 0  # IRQ counter enable flag
        @irqReload = 0   # IRQ counter reload flag

    ###########################################################
    # Mapper writing
    ###########################################################

    write: (address, value) ->
        switch address & 0xE001
            when 0x8000 then @writeBankCommand value  # $8000-$9FFE (100X), even
            when 0x8001 then @writeBankSelect value   # $8001-$9FFF (100X), odd
            when 0xA000 then @writeMirroring value    # $A000-$BFFE (101X), even
            when 0xA001 then @writePRGRAMEnable value # $A001-$BFFF (101X), odd
            when 0xC000 then @irqLatch = value        # $C000-$DFFE (110X), even
            when 0xC001 then @irqReload = true        # $C001-$DFFF (110X), odd
            when 0xE000 then @irqEnabled = false      # $E000-$FFFE (111X), even
            when 0xE001 then @irqEnabled = true       # $E001-$FFFF (111X), odd

    writeBankCommand: (value) ->
        @bankCommand = value
        @synchronizeMapping()

    writeBankSelect: (value) ->
        @bankSelect = value
        @synchronizeMapping()

    writeMirroring: (value) ->
        if value & 1
            @setHorizontalMirroring()
        else
            @setVerticalMirroring()

    writePRGRAMEnable: (value) ->
        # TODO

    ###########################################################
    # Mapper reconfiguration
    ###########################################################

    synchronizeMapping: ->
        switch @bankCommand & 7
            when 0, 1       then @switchDoubleCHRROMBanks() unless @hasCHRRAM
            when 2, 3, 4, 5 then @switchSingleCHRROMBanks() unless @hasCHRRAM
            when 6          then @switchPRGROMBanks0And2()
            when 7          then @switchPRGROMBank1()

    switchDoubleCHRROMBanks: ->
        srcBank = (@bankCommand & 0x80) >>> 6 | (@bankCommand & 0x02) >>> 1 # S[1,0] = C[7,1]
        @mapCHRROMBank2K srcBank, @bankSelect

    switchSingleCHRROMBanks: ->
        srcBank = (~@bankCommand & 0x80) >>> 5 | (@bankCommand - 2) & 0x03 # S[2,1,0] = (C-2)[!7,1,0]
        @mapCHRROMBank1K srcBank, @bankSelect

    switchPRGROMBanks0And2: ->
        srcBankA = (@bankCommand & 0x40) >>> 5  # SA[1] = C[6]
        srcBankB = (~@bankCommand & 0x40) >>> 5 # SB[1] = C[!6]
        @mapPRGROMBank8K srcBankA, @bankSelect  # Selected bank
        @mapPRGROMBank8K srcBankB, -2           # Second last bank

    switchPRGROMBank1: ->
        @mapPRGROMBank8K 1, @bankSelect

    ###########################################################
    # IRQ generation
    ###########################################################

    tickScanlineCounter: ->
        generateIRQ = not @irqReload and @irqCounter is 1
        @irqCounter--
        if @irqCounter <= 0 or @irqReload
            @irqCounter = @irqLatch
            @irqReload = false
        @generateIRQ and @irqEnabled

module.exports = MMC3
