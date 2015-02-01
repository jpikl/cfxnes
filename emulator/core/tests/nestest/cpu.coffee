DebugCPU = require "../../debug/debug-cpu"

###########################################################
# CPU mofified to execute all tests on nestest ROM
###########################################################

class NestestCPU extends DebugCPU

    handleReset: ->
        super()
        @programCounter = 0xC000

module.exports = NestestCPU
