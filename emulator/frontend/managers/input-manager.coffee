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
        logger.info "Initializing input manager"
        @nes = nes
        @deviceFactory = deviceFactory
        @initSources()
        @initTargets()
        @setDefaults()

    setDefaults: ->
        logger.info "Using default input configuration"
        @connectTarget 1, "joypad"
        @connectTarget 2, "zapper"
        @mapInput 1, "joypad", "a", "keyboard", "c"
        @mapInput 1, "joypad", "b", "keyboard", "x"
        @mapInput 1, "joypad", "start", "keyboard", "enter"
        @mapInput 1, "joypad", "select", "keyboard", "shift"
        @mapInput 1, "joypad", "up", "keyboard", "up"
        @mapInput 1, "joypad", "down", "keyboard", "down"
        @mapInput 1, "joypad", "left", "keyboard", "left"
        @mapInput 1, "joypad", "right", "keyboard", "right"
        @mapInput 2, "zapper", "trigger", "mouse", "left"

    ###########################################################
    # Source input devices
    ###########################################################

    initSources: ->
        @sources = {}        # Source input devices
        @sourcesMapping = {} # Mapping between sources and targets (target -> source)
        @registerSource id for id in [ "keyboard", "mouse" ]

    registerSource: (id) ->
        logger.info "Registering source input device '#{id}'"
        @sources[id] = @deviceFactory.createSourceDevice id

    processSourcesChanges: ->
        state = {}
        for id, source of @sources
            source.readState state
        for port, ids of @targets
            for id, target of ids
                target.stateChanged state

    ###########################################################
    # Target input devices
    ###########################################################

    initTargets: ->
        @targets = {}        # Target input devices (their adapters)
        @targetsMapping = {} # Mapping between sources and targets (source -> target)
        @registerTarget id for id in [ "joypad", "zapper" ]

    registerTarget: (id) ->
        logger.info "Registering target input device '#{id}'"
        for port in [ 1, 2 ]
            @targets[port] ?= {}
            @targets[port][id] = @deviceFactory.createTargetDevice id

    connectTarget: (port, id) ->
        logger.info "Setting target input device on port #{port} to '#{id}'"
        device = @targets[port]?[id]?.getDevice()
        @nes.connectInputDevice port, device

    getConnectedTarget: (port) ->
        for id, target of @targets[targetPort] or {}
            if @nes.getConnectedInputDevice() is target.getDevice()
                return id
        return null

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
            target = @targets[targetParams[0]]?[targetParams[1]]
            target?.inputChanged targetParams[2], inputDown
            true
        else
            false

    ###########################################################
    # Input recording
    ###########################################################

    recordInput: (targetPort, targetId, targetInput) ->
        logger.info "Recording input for '#{targetInput}' of '#{targetId}' on port #{targetPort}"
        @recordParams = [ targetPort, targetId, targetInput ]

    finishRecording: (sourceId, sourceInput) ->
        @mapInput @recordParams[0], @recordParams[1], @recordParams[2], sourceId, sourceInput
        @recordParams = null
        true

    ###########################################################
    # Input mapping
    ###########################################################

    mapInput: (targetPort, targetId, targetInput, sourceId, sourceInput) ->
        logger.info "Mapping '#{sourceInput}' of '#{sourceId}' to '#{targetInput}' of '#{targetId}' on port #{targetPort}"
        @unmapInput targetPort, targetId, targetInput, sourceId, sourceInput
        @targetsMapping[sourceId][sourceInput] = [ targetPort, targetId, targetInput ]
        @sourcesMapping[targetPort][targetId][targetInput] = [ sourceId, sourceInput ]

    unmapInput: (targetPort, targetId, targetInput, sourceId, sourceInput) ->
        targetParams = @sourcesMapping[sourceId]?[sourceInput]
        sourceParams = @targetsMapping[targetPort]?[targetId]?[targetInput]
        @sourcesMapping[sourceId]?[sourceInput] = null
        @sourcesMapping[sourceParams[0]]?[sourceParams[1]] = null if sourceParams
        @targetsMapping[targetPort]?[targetId]?[targetInput] = null
        @targetsMapping[targetParams[0]]?[targetParams[1]]?[targetParams[2]] = null if targetParams

    getMappedInputName: (targetPort, targetId, targetInput) ->
        sourceParams = @sourcesMapping[targetPort]?[targetId]?[targetInput]
        if sourceParams
            source = @sources[sourceParams[0]]
            source?.getInputName sourceParams[1]

    ###########################################################
    # Configuration reading / writing
    ###########################################################

    readConfig: (config) ->
        logger.info "Reading input manager configuration"
        for targetPort, targetId of config["input"]?["devices"]
            @connectTarget targetPort, targetId
        for sourceId, sourceInputs of config["input"]?["mapping"]
            for sourceInput, targetParams of sourceInputs
                @mapInput targetParams[0], targetParams[1], targetParams[2], sourceId, sourceInput

    writeConfig: (config) ->
        logger.info "Writing input manager configuration"
        config["input"] =
            "devices":
                1: @getConnectedTargetId 1
                2: @getConnectedTargetId 2
            "mapping": @targetsMapping

module.exports = InputManager
