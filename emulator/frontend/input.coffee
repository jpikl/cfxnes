###########################################################
# Input module
###########################################################

class Input

    ###########################################################
    # Ininitalization
    ###########################################################

    constructor: (@emulator) ->
        @injector = emulator.injector
        @nes = @injector.getInstance "nes"
        @sources = {} # Source devices
        @targets = {} # Target devices (their adapters)
        @sourcesMapping = {} # Mapping between sources and targets (target -> source)
        @targetsMapping = {} # Mapping between sources and targets (source -> target)
        @registerSource sourceDevice for sourceDevice in [ "keyboard", "mouse" ]
        @registerTarget targetDevice for targetDevice in [ "joypad", "zapper" ]

    registerSource: (sourceDevice) ->
        sourceClass = require "../devices/#{sourceDevice}"
        @sources[sourceDevice] = new sourceClass
        @sources[sourceDevice].attach this

    registerTarget: (targetDevice) ->
        targetClass = require "../devices/adapters/#{targetDevice}-adapter"
        for targetPort in [ 1, 2 ]
            @targets[targetPort] ?= {}
            @targets[targetPort][targetDevice] = new targetClass @injector

    ###########################################################
    # Target connection
    ###########################################################

    connectTarget: (targetPort, targetDevice) ->
        target = @targets[targetPort]?[targetDevice]
        @nes.connectInputDevice targetPort, target?.getAdaptee()

    getConnectedTarget: (targetPort) ->
        for targetDevice, target of @targets[targetPort] or {}
            if @nes.getConnectedInputDevice() is target.getAdaptee()
                return targetDevice
        return null

    ###########################################################
    # Input handling
    ###########################################################

    broadcastInput: (sourceInput, data) ->
        for targetPort, targetDevices of @targets
            for targetDevice, target of targetDevices
                target.inputBroadcasted? sourceInput, data

    processInput: (sourceDevice, sourceInput, down) ->
        if @recordParams
            @finishRecording sourceDevice, sourceInput unless down
        else
            @forwardInput sourceDevice, sourceInput, down

    forwardInput: (sourceDevice, sourceInput, down) ->
        targetParams = @targetsMapping[sourceDevice]?[sourceInput]
        if targetParams
            target = @targets[targetParams.port]?[targetParams.device]
            target?.inputChanged targetParams.input, down
            true
        else
            false

    ###########################################################
    # Input recording
    ###########################################################

    recordInput: (targetPort, targetDevice, targetInput) ->
        @recordParams =
            port: targetPort
            device: targetDevice
            input: targetInput

    finishRecording: (sourceDevice, sourceInput) ->
        @bindInput @recordParams.port, @recordParams.device, @recordParams.input, sourceDevice, sourceInput
        @recordParams = null
        true

    ###########################################################
    # Input mapping
    ###########################################################

    mapInput: (targetPort, targetDevice, targetInput, sourceDevice, sourceInput) ->
        @unmapInput targetPort, targetDevice, targetInput, sourceDevice, sourceInput
        @targetsMapping[sourceDevice][sourceInput] =
            port: targetPort
            device: targetDevice
            input: targetInput
        @sourcesMapping[targetPort][targetDevice][targetInput] =
            device: sourceDevice
            input: sourceInput

    unmapInput: (targetPort, targetDevice, targetInput, sourceDevice, sourceInput) ->
        targetParams = @sourcesMapping[sourceDevice]?[sourceInput]
        sourceParams = @targetsMapping[targetPort]?[targetDevice]?[targetInput]
        @sourcesMapping[sourceDevice]?[sourceInput] = null
        @sourcesMapping[sourceParams.device]?[sourceParams.input] = null if sourceParams
        @targetsMapping[targetPort]?[targetDevice]?[targetInput] = null
        @targetsMapping[targetParams.port]?[targetParams.device]?[targetParams.input] = null if targetParams

    getMappedInputName: (targetPort, targetDevice, targetInput) ->
        sourceParams = @sourcesMapping[targetPort]?[targetDevice]?[targetInput]
        if sourceParams
            source = @sources[sourceParams.device]
            source?.getInputName sourceParams.input

module.exports = Input
