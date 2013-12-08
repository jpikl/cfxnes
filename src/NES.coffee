class NES

    constructor: ->
        @ppu = null
        @papu = null
        @cpuMemory = new CPUMemory @ppu
        @cpu = new CPU @cpuMemory, @ppu, @papu

    insertCartridge: (cartridge) ->
        @cartridge = cartridge
        @cpuMemory.setCartridge cartridge

    removeCartridge: ->
        @cartridge = null
        @insertCartridge null

    loadCartridgeRAM: ->
        @cartridge.loadRAM()

    saveCartridgeRAM: ->
        @cartridge.saveRAM()

    pressReset: ->
        @cpu.reset()

    getController1: ->

    getController2: ->

    saveState: ->

    loadState: ->
