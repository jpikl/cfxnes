Interrupt = require("./common/types").Interrupt
TVSystem  = require("./common/types").TVSystem
colors    = require "./utils/colors"

###########################################################
# Nintendo Entertainment System
###########################################################

class NES

    @dependencies: [ "cpu", "cpuMemory", "ppu", "ppuMemory", "apu", "dma", "mapperFactory" ]

    init: (cpu, cpuMemory, ppu, ppuMemory, apu, dma, mapperFactory) ->
        @cpu = cpu
        @ppu = ppu
        @apu = apu
        @dma = dma
        @cpuMemory = cpuMemory
        @ppuMemory = ppuMemory
        @mapperFactory = mapperFactory

    ###########################################################
    # Buttons
    ###########################################################

    pressPower: ->
        if @isCartridgeInserted()
            @mapper.powerUp()
            @dma.powerUp()
            @apu.powerUp()
            @ppuMemory.powerUp()
            @ppu.powerUp()
            @cpuMemory.powerUp()
            @cpu.powerUp()

    pressReset: ->
        @cpu.activateInterrupt Interrupt.RESET

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
        @updateTVSystem()
        @pressPower()

    isCartridgeInserted: ->
        @cartridge?

    removeCartridge: ->
        @cartridge = null

    loadCartridgeData: (storage) ->
        @mapper?.loadPRGRAM storage
        @mapper?.loadCHRRAM storage

    saveCartridgeData: (storage) ->
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
        for i in [0...buffer.length]
            buffer[i] = colors.pack 0xFF * Math.random()
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
        buffer[i] = colors.BLACK for i in [0...buffer.length]
        undefined

    ###########################################################
    # Audio output
    ###########################################################

    initAudioRecording: (bufferSize) ->
        @apu.initRecording bufferSize

    startAudioRecording: (sampleRate) ->
        @apu.startRecording sampleRate

    stopAudioRecording: ->
        @apu.stopRecording()

    readAudioBuffer: ->
        @apu.readOutputBuffer()

    setChannelEnabled: (id, enabled) ->
        @apu.setChannelEnabled id, enabled

    isChannelEnabled: (id) ->
        @apu.isChannelEnabled id

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
        @updateTVSystem()

    getTVSystem: ->
        @tvSystem or @cartridge?.tvSystem or TVSystem.NTSC

    updateTVSystem: ->
        ntscMode = @getTVSystem() is TVSystem.NTSC
        @ppu.setNTSCMode ntscMode
        @apu.setNTSCMode ntscMode

module.exports = NES
