logger   = require("../../core/utils/logger").get()
TVSystem = require("../core/common/types").TVSystem

tvSystemAliases =
    "ntsc": TVSystem.NTSC
    "pal":  TVSystem.PAL

DEFAULT_TV_SYSTEM = null # Autodetection

###########################################################
# Execution manager
###########################################################

class ExecutionManager

    @dependencies: [ "nes", "videoManager", "inputManager" ]

    init: (nes, videoManager, inputManager) ->
        @nes = nes
        @videoManager = videoManager
        @inputManager = inputManager
        @initFPS()
        @setDefaults()

    setDefaults: ->
        logger.info "Using default execution configuration"
        @setTVSystem DEFAULT_TV_SYSTEM

    ###########################################################
    # Execution commands
    ###########################################################

    start: ->
        unless @isRunning()
            logger.info "Starting execution"
            @intervalId = setInterval @step, 1000 / @getTargetFPS()

    stop: ->
        if @isRunning()
            logger.info "Stopping execution"
            clearInterval @intervalId
            @intervalId = null

    restart: ->
        @stop()
        @start()

    isRunning: ->
        @intervalId?

    step: =>
        @videoManager.renderFrame()
        @videoManager.drawFrame()
        @inputManager.processSources()
        @updateFPS()

    ###########################################################
    # Inputs
    ###########################################################

    hardReset: ->
        logger.info "Hard reset"
        @nes.pressPower()

    softReset: ->
        logger.info "Soft reset"
        @nes.pressReset()

    ###########################################################
    # TV system
    ###########################################################

    setTVSystem: (tvSystem = DEFAULT_TV_SYSTEM) ->
        logger.info "Setting TV system to '#{tvSystem or 'autodetection mode'}'"
        @tvSystem = tvSystem
        @nes.setTVSystem tvSystemAliases[tvSystem]
        @restart() if @isRunning() # To refresh execution interval duration

    getTVSystem: ->
        @tvSystem

    ###########################################################
    # FPS conting
    ###########################################################

    initFPS: ->
        @fpsBuffer = (0 for [1..10])
        @fpsIndex = 0
        @fpsTime = 0

    updateFPS: ->
        timeNow = Date.now()
        @fpsBuffer[@fpsIndex] = 1000 / (timeNow - @fpsTime)
        @fpsIndex = (@fpsIndex + 1) % @fpsBuffer.length
        @fpsTime = timeNow

    getFPS: ->
        (@fpsBuffer.reduce (a, b) -> a + b) / @fpsBuffer.length

    getTargetFPS: ->
        tvSystem = @nes.getTVSystem()
        switch tvSystem
            when TVSystem.NTSC then 60.0988
            when TVSystem.PAL  then 50.0070
            else throw new Error "Unknown TV system #{tvSystem}"

    ###########################################################
    # Configuration reading / writing
    ###########################################################

    readConfiguration: (config) ->
        logger.info "Reading execution manager configuration"
        if config["execution"]
            @setTVSystem config["execution"]["tvSystem"]

    writeConfiguration: (config) ->
        logger.info "Writing execution manager configuration"
        config["execution"] =
            "tvSystem": @getTVSystem()

module.exports = ExecutionManager
