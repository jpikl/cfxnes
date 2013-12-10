CPU           = require "./CPU"
CPUMemory     = require "./CPUMemory"
MapperFactory = require "./MapperFactory"

class NES

    constructor: ->
        @ppuMemory = null
        @ppu = null
        @papu = null
        @cpuMemory = new CPUMemory @ppu
        @cpu = new CPU @cpuMemory, @ppu, @papu

    insertCartridge: (cartridge) ->
        mapper = MapperFactory.createMapper cartridge
        @ppuMemory.setMMC mapper
        @cpuMemory.setMMC mapper

    pressReset: ->
        @cpu.reset()
