###########################################################
# Nintendo Entertainment System
###########################################################

FRAME_SIZE = 256 * 250 *

class NES

    @inject: [ "cpu", "cpuMemory", "ppu", "ppuMemory", "apu", "mapperFactory" ]

    constructor: ->
        @whiteNoise = (0xFF for i in [0 ... 256 * 240 * 4])

    insertCartridge: (cartridge) ->
        @mmc = @mapperFactory.createMapper cartridge
        @mmc.powerUp()
        @ppuMemory.setMMC @mmc
        @cpuMemory.setMMC @mmc

    pressPower: ->
        @mmc?.powerUp()
        @apu.powerUp()
        @ppuMemory.powerUp()
        @ppu.powerUp()
        @cpuMemory.powerUp()
        @cpu.powerUp()

    pressReset: ->
        @cpu.reset()

    setInputDevice1: (device) ->
        @cpuMemory.setInputDevice1 device

    setInputDevice2: (device) ->
        @cpuMemory.setInputDevice2 device

    renderFrame: ->
        if @mmc? then @renderFrameUsingPPU() else @renderWhiteNoise()

    renderWhiteNoise: ->
        for i in [0...@whiteNoise.length] by 4
           @whiteNoise[i] = @whiteNoise[i + 1] = @whiteNoise[i + 2] = 0xFF * Math.random()
        @whiteNoise

    renderFrameUsingPPU: ->
        @step() until @ppu.isFrameAvailable()
        @ppu.readFrame()

    step: ->
        @cpu.step()

module.exports = NES
