Logger = require "./utils/Logger"

logger = Logger.get()

###########################################################
# Audio processing unit
###########################################################

class APU

    ###########################################################
    # Power-up state initialization
    ###########################################################

    powerUp: ->
        logger.info "Reseting APU"
        @resetRegisters()

    resetRegisters: ->
        # TODO

    ###########################################################
    # Sound generation
    ###########################################################

    tick: ->

module.exports = APU
