Types    = require "./Types"

TVSystem = Types.TVSystem

###########################################################
# Nintendo Entertainment System
###########################################################

class NES

    @inject: [ "cpu", "cpuMemory", "ppu", "ppuMemory", "apu", "dma", "mapperFactory", "storage" ]

    constructor: ->
        @videoDebug = false

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
        @ppuMemory.connectMapper @mapper
        @cpuMemory.connectMapper @mapper
        @mapper.powerUp()
        @changeTVSystem()

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
    # Video ouput and emulation
    ###########################################################

    renderFrame: (buffer) ->
        if @isCartridgeInserted()
            @renderNormalFrame buffer
        else
            @renderWhiteNoise buffer

    renderWhiteNoise: (buffer) ->
        for i in [0...buffer.length] by 4
           buffer[i] = buffer[i + 1] = buffer[i + 2] = 0xFF * Math.random()
        undefined

    renderNormalFrame: (buffer) ->
        @ppu.startFrame buffer
        @cpu.step() until @ppu.isFrameAvailable()
        @ppu.renderDebugFrame() if @videoDebug # Overrides buffer

    step: ->
        @cpu.step()

    setVideoPalette: (palette) ->
        @ppu.setRGBAPalette palette

    setVideoDebug: (enabled) ->
        @videoDebug = enabled

    setTVSystem: (system) ->
        @tvSystem = system
        @changeTVSystem()

    changeTVSystem: ->
        @ppu.setNTSCMode @getTVSystem() is TVSystem.NTSC

    getTVSystem: ->
        @tvSystem or @cartridge?.tvSystem

module.exports = NES
