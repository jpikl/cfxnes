CoreDeviceFactory = require "../../core/factories/device-factory"

###########################################################
# Factory for device creation
###########################################################

class DeviceFactory extends CoreDeviceFactory

    constructor: (@injector) ->

    createSourceDevice: (deviceName) ->
        deviceClass = require "../devices/#{deviceName}"
        @injector.injectInstance new deviceClass deviceName

    createTargetDevice: (deviceName) ->
        device = @createDevice deviceName
        adapterClass = require "../devices/adapters/#{deviceName}-adapter"
        @injector.injectInstance new adapterClass device

module.exports = DeviceFactory
