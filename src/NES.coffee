###########################################################
# Nintendo Entertainment System
###########################################################

class NES

    @inject: [ "cpu", "cpuMemory", "ppu", "ppuMemory", "apu", "mapperFactory" ]

    constructor: ->
        @videoDebug = false

    ###########################################################
    # Inputs
    ###########################################################

    pressPower: ->
        @mmc?.powerUp()
        @apu.powerUp()
        @ppuMemory.powerUp()
        @ppu.powerUp()
        @cpuMemory.powerUp()
        @cpu.powerUp()

    pressReset: ->
        @cpu.reset()
        @mmc?.reset()

    insertCartridge: (cartridge) ->
        @mmc = @mapperFactory.createMapper cartridge
        @mmc.powerUp()
        @ppuMemory.setMMC @mmc
        @cpuMemory.setMMC @mmc

    isCartridgeInserted: ->
        @mmc?

    connectInputDevice: (port, device) ->
        @cpuMemory.setInputDevice port, device

    getConnectedInputDevice: (port) ->
        @cpuMemory.getInputDevice port

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

    setVideoDebug: (enabled) ->
        @videoDebug = enabled

module.exports = NES
