###########################################################
# Nintendo Entertainment System
###########################################################

class NES

    @inject: [ "cpu", "cpuMemory", "ppu", "ppuMemory", "apu", "mapperFactory" ]

    constructor: ->
        @whiteNoise = (0xFF for i in [0 ... 256 * 240 * 4])

    ###########################################################
    # Inputs & controls
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

    insertCartridge: (cartridge) ->
        @mmc = @mapperFactory.createMapper cartridge
        @mmc.powerUp()
        @ppuMemory.setMMC @mmc
        @cpuMemory.setMMC @mmc

    connectInputDevice: (port, device) ->
        @cpuMemory.setInputDevice port, device

    ###########################################################
    # Emulation & video ouput
    ###########################################################

    renderFrame: ->
        if @mmc then @renderFrameUsingPPU() else @renderWhiteNoise()

    renderWhiteNoise: ->
        for i in [0...@whiteNoise.length] by 4
           @whiteNoise[i] = @whiteNoise[i + 1] = @whiteNoise[i + 2] = 0xFF * Math.random()
        @whiteNoise

    renderFrameUsingPPU: ->
        @step() until @ppu.isFrameAvailable()
        @ppu.readFrame()

    step: ->
        @cpu.step()

    setVideoDebug: (enabled) ->
        @ppu.setDebugMode enabled

module.exports = NES
