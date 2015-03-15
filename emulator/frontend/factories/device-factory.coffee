CoreDeviceFactory = require "../../core/factories/device-factory"

###########################################################
# Factory for device creation
###########################################################

class DeviceFactory extends CoreDeviceFactory

    constructor: (@injector) ->
        @sourceDevices =
            "keyboard": require "../devices/keyboard"
            "mouse":    require "../devices/mouse"
        @targetDevices =
            "joypad": require "../../core/devices/joypad"
            "zapper": require "../../core/devices/zapper"
        @targetDevicesAdapters =
            "joypad": require "../devices/adapters/joypad-adapter"
            "zapper": require "../devices/adapters/zapper-adapter"

    createSourceDevice: (id) ->
        @injector.injectInstance new @sourceDevices[id] id

    createTargetDevice: (id) ->
        device = @injector.injectInstance new @targetDevices[id]
        @injector.injectInstance new @targetDevicesAdapters[id] device

module.exports = DeviceFactory
