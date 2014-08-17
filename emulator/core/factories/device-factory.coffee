logger = require("../utils/logger").get()

###########################################################
# Factory for device creation
###########################################################

class DeviceFactory

    constructor: (@injector) ->

    createDevice: (id) ->
        logger.info "Creating device '#{id}'"
        deviceClass = require "../devices/#{id}"
        @injector.injectInstance new deviceClass

module.exports = DeviceFactory
