AbstractMapper = require "./abstract-mapper"
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
        @irqLatch = 0   # Initial IRQ counter value
        @irqCounter = 0 # IRQ counter value
        @irqEnabled = 0 # IRQ counter enable flag
        @irqReload = 0  # IRQ counter reload flag

    ###########################################################
    # Mapper writing
    ###########################################################

    write: (address, value) ->
        switch address & 0xE001
            when 0x8000 then @command = value         # $8000-$9FFE (100X), even
            when 0x8001 then @writeBankSelect value   # $8001-$9FFF (100X), odd
            when 0xA000 then @writeMirroring value    # $A000-$BFFE (101X), even
            when 0xA001 then @writePRGRAMEnable value # $A001-$BFFF (101X), odd
            when 0xC000 then @irqLatch = value        # $C000-$DFFE (110X), even
            when 0xC001 then @irqReload = true        # $C001-$DFFF (110X), odd
            when 0xE000 then @irqEnabled = false      # $E000-$FFFE (111X), even
            when 0xE001 then @irqEnabled = true       # $E001-$FFFF (111X), odd

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
    # Scanline counter and IRQ generation
    ###########################################################

    tick: ->
        if @$isScanlineTick() and @updateScanlineCounter()
            @cpu.sendIRQ()

    isScanlineTick: ->
        # Precise emulation would require watching changes of A12 ($1000) on the PPU bus.
        # However we can use this simplification that would work for most games.
        261 <= @ppu.cycle <= 263 and  # There is only one tick after dot 260 on each scanline (261, 262, 263, 261, etc.)
        @ppu.scanline <= 240 and      # 240 rendering scanlines + 1 prerender scanline
        @ppu.isRenderingEnabled() and # PPU must be enabled
        @ppu.bgPatternTableAddress != @ppu.spPatternTableAddress # A12 must change from 0 to 1

    updateScanlineCounter: ->
        generateIRQ = not @irqReload and @irqCounter is 1
        if @irqCounter is 0 or @irqReload
            @irqCounter = @irqLatch
            @irqReload = false
        else
            @irqCounter--
        generateIRQ and @irqEnabled

module.exports = MMC3
