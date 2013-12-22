DebugCPU = require "../../src/debug/DebugCPU"

class TestCPU extends DebugCPU

    constructor: (cpuMemory, ppu, papu) ->
        super(cpuMemory, ppu, papu)

    handleReset: ->
        super()
        @programCounter = 0xC000

module.exports = TestCPU
