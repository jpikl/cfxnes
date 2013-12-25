class NES
    
    constructor: (@cpu, @cpuMemory, @ppu, @ppuMemory, @mapperFactory) ->

    insertCartridge: (cartridge) ->
        mapper = @mapperFactory.createMapper cartridge
        @ppuMemory.setMMC mapper
        @cpuMemory.setMMC mapper

    pressPower: ->
        @cpu.powerUp()

    pressReset: ->
        @cpu.reset()

    step: ->
        @cpu.step()

module.exports = NES
