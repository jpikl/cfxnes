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
        @clearMapping()
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
        @sources = {} # Source input devices
        @registerSource id for id in [ "keyboard", "mouse" ]

    registerSource: (id) ->
        logger.info "Registering source input device '#{id}'"
        @sources[id] = @deviceFactory.createSourceDevice id

    processSources: ->
        state = {}
        for id, source of @sources
            source.readState? state
        for port, ids of @targets
            for id, target of ids
                target.stateChanged? state

    ###########################################################
    # Target input devices
    ###########################################################

    initTargets: ->
        @targets = {}  # Target input devices (their adapters)
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
        for id, target of @targets[port]
            if @nes.getConnectedInputDevice(port) is target.getDevice()
                return id
        return null

    ###########################################################
    # Input handling
    ###########################################################

    processInput: (sourceId, sourceInput, inputDown) ->
        if @isRecording()
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

    recordInput: (callback) ->
        logger.info "Recording input"
        @recordCallback = callback

    isRecording: ->
        @recordCallback?

    finishRecording: (sourceId, sourceInput) ->
        logger.info "Caught input '#{sourceInput}' from '#{sourceId}'"
        @recordCallback sourceId, sourceInput
        @recordCallback = null
        true

    ###########################################################
    # Input mapping
    ###########################################################

    clearMapping: ->
        @sourcesMapping = {} # Mapping between sources and targets (target -> source)
        @targetsMapping = {} # Mapping between sources and targets (source -> target)

    mapInput: (targetPort, targetId, targetInput, sourceId, sourceInput) ->
        logger.info "Mapping '#{sourceInput}' of '#{sourceId}' to '#{targetInput}' of '#{targetId}' on port #{targetPort}"
        @unmapInput targetPort, targetId, targetInput, sourceId, sourceInput
        @targetsMapping[sourceId] ?= {}
        @targetsMapping[sourceId][sourceInput] = [ targetPort, targetId, targetInput ]
        @sourcesMapping[targetPort] ?= {}
        @sourcesMapping[targetPort][targetId] ?= {}
        @sourcesMapping[targetPort][targetId][targetInput] = [ sourceId, sourceInput ]

    unmapInput: (targetPort, targetId, targetInput, sourceId, sourceInput) ->
        sourceParams = @sourcesMapping[targetPort]?[targetId]?[targetInput]
        targetParams = @targetsMapping[sourceId]?[sourceInput]
        @sourcesMapping[targetPort]?[targetId]?[targetInput] = null
        @sourcesMapping[targetParams[0]]?[targetParams[1]]?[targetParams[2]] = null if targetParams
        @targetsMapping[sourceId]?[sourceInput] = null
        @targetsMapping[sourceParams[0]]?[sourceParams[1]] = null if sourceParams

    getMappedInputName: (targetPort, targetId, targetInput) ->
        sourceParams = @sourcesMapping[targetPort]?[targetId]?[targetInput]
        if sourceParams
            source = @sources[sourceParams[0]]
            source?.getInputName sourceParams[1]

    ###########################################################
    # Configuration reading / writing
    ###########################################################

    readConfiguration: (config) ->
        logger.info "Reading input manager configuration"
        devicesConfig = config["input"]?["devices"]
        for targetPort, targetId of devicesConfig
            @connectTarget targetPort, targetId
        mappingConfig = config["input"]?["mapping"]
        @clearMapping() if mappingConfig
        for sourceId, sourceInputs of mappingConfig
            for sourceInput, targetParams of sourceInputs when targetParams
                @mapInput targetParams[0], targetParams[1], targetParams[2], sourceId, sourceInput

    writeConfiguration: (config) ->
        logger.info "Writing input manager configuration"
        config["input"] =
            "devices":
                1: @getConnectedTarget 1
                2: @getConnectedTarget 2
            "mapping": @targetsMapping

module.exports = InputManager
