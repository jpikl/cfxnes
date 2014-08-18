logger = require("../../core/utils/logger").get()

###########################################################
# Input manager
###########################################################

class InputManager

    @dependencies = [ "nes", "deviceFactory" ]

    ###########################################################
    # Ininitalization
    ###########################################################

    init: (nes, deviceFactory) ->
        @nes = nes
        @deviceFactory = deviceFactory
        @sources = {} # Source devices
        @targets = {} # Target devices (their adapters)
        @sourcesMapping = {} # Mapping between sources and targets (target -> source)
        @targetsMapping = {} # Mapping between sources and targets (source -> target)
        @registerSource id for id in [ "keyboard", "mouse" ]
        @registerTarget id for id in [ "joypad", "zapper" ]

    registerSource: (id) ->
        @sources[id] = @deviceFactory.createSourceDevice id

    registerTarget: (id) ->
        for port in [ 1, 2 ]
            @targets[port] ?= {}
            @targets[port][id] = @deviceFactory.createTargetDevice id

    ###########################################################
    # Target connection
    ###########################################################

    connectTarget: (port, id) ->
        device = @targets[port]?[id]?.getDevice()
        @nes.connectInputDevice port, device

    getConnectedTargetId: (port) ->
        for id, target of @targets[targetPort] or {}
            if @nes.getConnectedInputDevice() is target.getDevice()
                return id
        return null

    ###########################################################
    # Source state changes
    ###########################################################

    processSourceChanges: ->
        state = {}
        for id, source of @sources
            source.readState state
        for port, ids of @targets
            for id, target of ids
                target.stateChanged state

    ###########################################################
    # Input handling
    ###########################################################

    processInput: (sourceId, sourceInput, inputDown) ->
        if @recordParams
            @finishRecording sourceId, sourceInput unless inputDown
        else
            @forwardInput sourceId, sourceInput, inputDown

    forwardInput: (sourceId, sourceInput, inputDown) ->
        targetParams = @targetsMapping[sourceId]?[sourceInput]
        if targetParams
            target = @targets[targetParams.port]?[targetParams.id]
            target?.inputChanged targetParams.input, inputDown
            true
        else
            false

    ###########################################################
    # Input recording
    ###########################################################

    recordInput: (targetPort, targetId, targetInput) ->
        @recordParams =
            port:  targetPort
            id:    targetId
            input: targetInput

    finishRecording: (sourceId, sourceInput) ->
        @bindInput @recordParams.port, @recordParams.id, @recordParams.input, sourceId, sourceInput
        @recordParams = null
        true

    ###########################################################
    # Input mapping
    ###########################################################

    mapInput: (targetPort, targetId, targetInput, sourceId, sourceInput) ->
        @unmapInput targetPort, targetId, targetInput, sourceId, sourceInput
        @targetsMapping[sourceId][sourceInput] =
            port:  targetPort
            id:    targetId
            input: targetInput
        @sourcesMapping[targetPort][targetId][targetInput] =
            id:    sourceId
            input: sourceInput

    unmapInput: (targetPort, targetId, targetInput, sourceId, sourceInput) ->
        targetParams = @sourcesMapping[sourceId]?[sourceInput]
        sourceParams = @targetsMapping[targetPort]?[targetId]?[targetInput]
        @sourcesMapping[sourceId]?[sourceInput] = null
        @sourcesMapping[sourceParams.id]?[sourceParams.input] = null if sourceParams
        @targetsMapping[targetPort]?[targetId]?[targetInput] = null
        @targetsMapping[targetParams.port]?[targetParams.id]?[targetParams.input] = null if targetParams

    getMappedInputName: (targetPort, targetId, targetInput) ->
        sourceParams = @sourcesMapping[targetPort]?[targetId]?[targetInput]
        if sourceParams
            source = @sources[sourceParams.id]
            source?.getInputName sourceParams.input

    ###########################################################
    # Configuration reading / writing
    ###########################################################

    readConfig: (config) ->
        logger.info "Reading input configuration"
        devices = config.input?.devices
        mapping = config.input?.mapping
        # TODO

    writeConfig: (config) ->
        logger.info "Writing input configuration"
        config.input =
            devices:
                1: @getConnectedTargetId 1
                2: @getConnectedTargetId 2
            mapping: @targetsMapping

module.exports = InputManager
