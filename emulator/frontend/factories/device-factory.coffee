CoreDeviceFactory = require "../../core/factories/device-factory"

###########################################################
# Factory for device creation
###########################################################

class DeviceFactory extends CoreDeviceFactory

    constructor: (@injector) ->

    createSourceDevice: (id) ->
        deviceClass = require "../devices/#{id}"
        @injector.injectInstance new deviceClass id

    createTargetDevice: (id) ->
        device = @createDevice id
        adapterClass = require "../devices/adapters/#{id}-adapter"
        @injector.injectInstance new adapterClass device

module.exports = DeviceFactory
