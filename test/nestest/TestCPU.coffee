DebugCPU = require "../../src/debug/DebugCPU"

class TestCPU extends DebugCPU

    handleReset: ->
        super()
        @programCounter = 0xC000

module.exports = TestCPU
