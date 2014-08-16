TVSystem = require("./common/types").TVSystem

###########################################################
# Nintendo Entertainment System
###########################################################

class NES

    @dependencies: [ "cpu", "cpuMemory", "ppu", "ppuMemory", "apu", "dma", "mapperFactory" ]

    inject: (cpu, cpuMemory, ppu, ppuMemory, apu, dma, mapperFactory) ->
        @cpu = cpu
        @cpuMemory = cpuMemory
        @ppu = ppu
        @ppuMemory = ppuMemory
        @apu = apu
        @dma = dma
        @mapperFactory = mapperFactory

    ###########################################################
    # Buttons
    ###########################################################

    pressPower: ->
        @mapper?.powerUp()
        @dma.powerUp()
        @apu.powerUp()
        @ppuMemory.powerUp()
        @ppu.powerUp()
        @cpuMemory.powerUp()
        @cpu.powerUp()

    pressReset: ->
        @cpu.sendReset()

    ###########################################################
    # Input devices
    ###########################################################

    connectInputDevice: (port, device) ->
        @cpuMemory.setInputDevice port, device

    getConnectedInputDevice: (port) ->
        @cpuMemory.getInputDevice port

    ###########################################################
    # Cartridges
    ###########################################################

    insertCartridge: (cartridge) ->
        @cartridge = cartridge
        @mapper = @mapperFactory.createMapper cartridge
        @cpu.connectMapper @mapper
        @ppu.connectMapper @mapper
        @cpuMemory.connectMapper @mapper
        @ppuMemory.connectMapper @mapper
        @mapper.powerUp()
        @processTVSystemChange()

    isCartridgeInserted: ->
        @cartridge?

    ###########################################################
    # Persistence
    ###########################################################

    loadData: (storage) ->
        @mapper?.loadPRGRAM storage
        @mapper?.loadCHRRAM storage

    saveData: (storage) ->
        @mapper?.savePRGRAM storage
        @mapper?.saveCHRRAM storage

    ###########################################################
    # Video ouput
    ###########################################################

    renderFrame: (buffer) ->
        if @isCartridgeInserted()
            @renderNormalFrame buffer
        else
            @renderEmptyFrame buffer

    renderNormalFrame: (buffer) ->
        @ppu.startFrame buffer
        @cpu.step() until @ppu.isFrameAvailable()

    renderEmptyFrame: (buffer) ->
        for i in [0...buffer.length] by 4
           buffer[i] = buffer[i + 1] = buffer[i + 2] = 0xFF * Math.random()
        undefined

    ###########################################################
    # Video ouput - debugging
    ###########################################################

    renderDebugFrame: (buffer) ->
        if @isCartridgeInserted()
            @renderNormalDebugFrame buffer
        else
            @renderEmptyDebugFrame buffer

    renderNormalDebugFrame: (buffer) ->
        @ppu.startFrame buffer
        @ppu.renderDebugFrame()

    renderEmptyDebugFrame: (buffer) ->
        for i in [0...buffer.length] by 4
           buffer[i] = buffer[i + 1] = buffer[i + 2] = 0
        undefined

    ###########################################################
    # Emulation
    ###########################################################

    step: ->
        @cpu.step()

    ###########################################################
    # Configuration
    ###########################################################

    setRGBAPalette: (rgbaData) ->
        @ppu.setRGBAPalette rgbaData

    setTVSystem: (tvSystem) ->
        @tvSystem = tvSystem
        @processTVSystemChange()

    getTVSystem: ->
        @tvSystem or @cartridge?.tvSystem or TVSystem.NTSC

    processTVSystemChange: ->
        @ppu.setNTSCMode @getTVSystem() is TVSystem.NTSC

module.exports = NES
