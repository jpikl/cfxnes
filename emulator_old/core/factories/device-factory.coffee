logger = require("../utils/logger").get()

deviceClasses = {
    "joypad"
}
Joypad =

###########################################################
# Factory for device creation
###########################################################

class DeviceFactory

    constructor: (@injector) ->
        @devices =
            "joypad": require "../devices/joypad"
            "zapper": require "../devices/zapper"

    createDevice: (id) ->
        logger.info "Creating device '#{id}'"
        @injector.injectInstance new @devices[id]

module.exports = DeviceFactory
