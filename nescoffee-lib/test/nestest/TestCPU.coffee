DebugCPU = require "../../src/debug/DebugCPU"

###########################################################
# CPU mofified to execute all tests on nestest ROM
###########################################################

class TestCPU extends DebugCPU

    handleReset: ->
        super()
        @programCounter = 0xC000

module.exports = TestCPU
