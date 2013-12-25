class NES
    
    constructor: (@cpu, @cpuMemory, @ppu, @ppuMemory, @mapperFactory) ->

    insertCartridge: (cartridge) ->
        mapper = @mapperFactory.createMapper cartridge
        @ppuMemory.setMMC mapper
        @cpuMemory.setMMC mapper

    pressReset: ->
        @cpu.reset()

    pressPowerOn: ->
        @cpu.powerOn()

    step: ->
        @cpu.step()

module.exports = NES
