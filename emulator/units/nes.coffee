types = require "../common/types"
TVSystem = types.TVSystem

###########################################################
# Nintendo Entertainment System
###########################################################

class NES

    @inject: [ "cpu", "cpuMemory", "ppu", "ppuMemory", "apu", "dma", "mapperFactory", "storage" ]

    ###########################################################
    # Inputs
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

    insertCartridge: (cartridge) ->
        @cartridge = cartridge
        @mapper = @mapperFactory.createMapper cartridge
        @cpu.connectMapper @mapper
        @ppu.connectMapper @mapper
        @cpuMemory.connectMapper @mapper
        @ppuMemory.connectMapper @mapper
        @mapper.powerUp()
        @updateTVSystem()

    isCartridgeInserted: ->
        @cartridge?

    connectInputDevice: (port, device) ->
        @cpuMemory.setInputDevice port, device

    getConnectedInputDevice: (port) ->
        @cpuMemory.getInputDevice port

    ###########################################################
    # Persistence
    ###########################################################

    setStorage: (storage) ->
        @storage = storage

    loadData: ->
        @mapper?.loadPRGRAM @storage
        @mapper?.loadCHRRAM @storage

    saveData: ->
        @mapper?.savePRGRAM @storage
        @mapper?.saveCHRRAM @storage

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

    setVideoPalette: (palette) ->
        @ppu.setRGBAPalette palette

    setTVSystem: (system) ->
        @tvSystem = system
        @updateTVSystem()

    updateTVSystem: ->
        @ppu.setNTSCMode @getTVSystem() is TVSystem.NTSC

    getTVSystem: ->
        @tvSystem or @cartridge?.tvSystem or TVSystem.NTSC

module.exports = NES
