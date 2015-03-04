AbstractMapper = require "./abstract-mapper"
Interrupt      = require("../common/types").Interrupt
Mirroring      = require("../common/types").Mirroring

###########################################################
# MMC3 mapper
###########################################################

class MMC3 extends AbstractMapper

    @dependencies: [ "cpu", "ppu", "cpuMemory", "ppuMemory" ]

    inject: (cpu, ppu, cpuMemory, ppuMemory) ->
        super cpuMemory, ppuMemory
        @cpu = cpu
        @ppu = ppu

    ###########################################################
    # Mapper initialization
    ###########################################################

    init: (cartridge) ->
        super cartridge
        @hasPRGRAM = true
        @alternateMode = false

    reset: ->
        @resetMapping()
        @resetRegisters()

    resetMapping: ->
        @mapPRGROMBank32K 0, -1                   # Last 32K PRG ROM bank
        @mapPRGRAMBank8K  0,  0                   # 8K PRG RAM
        @mapCHRROMBank8K  0,  0 unless @hasCHRRAM # First 8K CHR ROM bank (if it is present)
        @mapCHRRAMBank8K  0,  0 if     @hasCHRRAM # 8K CHR RAM (if CHR ROM is not present)

    resetRegisters: ->
        @command = 0    # Bank command
        @irqCounter = 0 # IRQ counter value
        @irqLatch = 0   # IRQ counter reload value
        @irqReload = 0  # IRQ counter reload flag
        @irqEnabled = 0 # IRQ counter enable flag
        @irqDelay = 0   # Delay befor checking A12 rising edge

    ###########################################################
    # Mapper writing
    ###########################################################

    write: (address, value) ->
        switch address & 0xE001
            when 0x8000 then @command = value         # $8000-$9FFE (100X), even address
            when 0x8001 then @writeBankSelect value   # $8001-$9FFF (100X), odd  address
            when 0xA000 then @writeMirroring value    # $A000-$BFFE (101X), even address
            when 0xA001 then @writePRGRAMEnable value # $A001-$BFFF (101X), odd  address
            when 0xC000 then @irqLatch = value        # $C000-$DFFE (110X), even address
            when 0xC001 then @writeIRQReload()        # $C001-$DFFF (110X), odd  address
            when 0xE000 then @writeIRQEnable false    # $E000-$FFFE (111X), even address
            when 0xE001 then @writeIRQEnable true     # $E001-$FFFF (111X), odd  address

    writeBankSelect: (value) ->
        switch @command & 7
            when 0, 1       then @switchDoubleCHRROMBanks value unless @hasCHRRAM
            when 2, 3, 4, 5 then @switchSingleCHRROMBanks value unless @hasCHRRAM
            when 6          then @switchPRGROMBanks0And2 value
            when 7          then @switchPRGROMBank1 value

    writeMirroring: (value) ->
        if @mirroring isnt Mirroring.FOUR_SCREEN
            @switchMirroring value

    writePRGRAMEnable: (value) ->
        # TODO

    writeIRQReload: ->
        @irqReload = true if @alternateMode
        @irqCounter = 0

    writeIRQEnable: (enabled) ->
        @irqEnabled = enabled
        @cpu.clearInterrupt Interrupt.IRQ_EXT unless enabled # Disabling IRQ clears IRQ flag

    ###########################################################
    # Bank switching
    ###########################################################

    switchDoubleCHRROMBanks: (target) ->
        source = (@command & 0x80) >>> 6 | @command & 0x01 # S[1,0] = C[7,0]
        @mapCHRROMBank2K source, target >>> 1

    switchSingleCHRROMBanks: (target) ->
        source = (~@command & 0x80) >>> 5 | (@command - 2) & 0x03 # S[2,1,0] = (C-2)[!7,1,0]
        @mapCHRROMBank1K source, target

    switchPRGROMBanks0And2: (target) ->
        sourceA = (@command & 0x40) >>> 5  # SA[1] = C[6]
        sourceB = (~@command & 0x40) >>> 5 # SB[1] = C[!6]
        @mapPRGROMBank8K sourceA, target   # Selected bank
        @mapPRGROMBank8K sourceB, -2       # Second last bank

    switchPRGROMBank1: (target) ->
        @mapPRGROMBank8K 1, target

    switchMirroring: (value) ->
        if value & 1
            @setHorizontalMirroring()
        else
            @setVerticalMirroring()

    ###########################################################
    # IRQ generation
    ###########################################################

    # Mapper watches changes on PPU address bus bit 12 (A12).
    # Each time raising edge on A12 is detected, IRQ counter is updated.
    # The rising edge is detected after A12 stays low for some time.
    #
    # A12  ____      _____  1
    #          |    |
    #          |____|       0
    #
    #               ^
    #             rising
    #              edge
    #
    # IRQ counter update:
    # - When the counter reaches zero or reload flag is set, the counter is reloaded from latch.
    #   Otherwise the counter value is decremented.
    # - When the counter is reloaded the reload flag is also cleared.
    #
    # IRQ generation:
    # - Normal behaviour    - checks whether IRQ is enabled and the counter is zero
    # - Alternate behaviour - additionaly checks that the counter was set to zero either by decrementation or reload

    tick: ->
        if @ppu.addressBus & 0x1000
            @$updateIRQCounter() unless @irqDelay
            @irqDelay = 7
        else if @irqDelay
            @irqDelay--

    updateIRQCounter: ->
        irqCounterOld = @irqCounter
        if not @irqCounter or @irqReload
            @irqCounter = @irqLatch
        else
            @irqCounter--
        if @irqEnabled and not @irqCounter and  (not @alternateMode or not irqCounterOld or @irqReload)
            @cpu.activateInterrupt Interrupt.IRQ_EXT
        @irqReload = false

module.exports = MMC3
