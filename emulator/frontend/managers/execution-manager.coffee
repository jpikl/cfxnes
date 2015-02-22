logger   = require("../../core/utils/logger").get()
TVSystem = require("../../core/common/types").TVSystem

tvSystemAliases =
    "ntsc": TVSystem.NTSC
    "pal":  TVSystem.PAL

DEFAULT_TV_SYSTEM = null # Autodetection
DFEFAULT_SPEED = 1

###########################################################
# Execution manager
###########################################################

class ExecutionManager

    @dependencies: [ "nes", "videoManager", "audioManager", "inputManager" ]

    init: (nes, videoManager, audioManager, inputManager) ->
        @nes = nes
        @videoManager = videoManager
        @audioManager = audioManager
        @inputManager = inputManager
        @initFPS()
        @initListeners()
        @setDefaults()

    initListeners: ->
        window.addEventListener "focus", @onFocus
        window.addEventListener "blur", @onBlur

    setDefaults: ->
        logger.info "Using default execution configuration"
        @setTVSystem DEFAULT_TV_SYSTEM
        @setSpeed DFEFAULT_SPEED

    ###########################################################
    # Execution commands
    ###########################################################

    start: ->
        unless @isRunning()
            logger.info "Starting execution"
            period = 1000 / (@speed * @getTargetFPS())
            @executionId = setInterval @step, period
            @audioManager.setPlaying true

    stop: ->
        if @isRunning()
            logger.info "Stopping execution"
            clearInterval @executionId
            @executionId = null
            @audioManager.setPlaying false

    restart: ->
        @stop()
        @start()

    isRunning: ->
        @executionId?

    step: =>
        @inputManager.processSources()
        @videoManager.renderFrame()
        @updateFPS()
        cancelAnimationFrame @drawId # Cancel previous request if it wasnt performed yet
        @drawId = requestAnimationFrame @draw

    draw: =>
        @videoManager.drawFrame()

    ###########################################################
    # Focus / Blur
    ###########################################################

    onFocus: =>
        logger.info "Gained focus"
        @start() if @runningBeforeBlur

    onBlur: =>
        logger.info "Lost focus"
        @runningBeforeBlur = @isRunning()
        @stop()

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
        @restart() if @isRunning() # To refresh execution interval

    getTVSystem: ->
        @tvSystem

    ###########################################################
    # Emulation speed
    ###########################################################

    setSpeed: (speed = DFEFAULT_SPEED) ->
        logger.info "Setting emulation speed to #{speed}x"
        @speed = speed
        @restart() if @isRunning() # To refresh execution interval
        @audioManager.setSpeed speed

    getSpeed: ->
        @speed

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
            when TVSystem.NTSC then 60
            when TVSystem.PAL  then 50
            else throw new Error "Unknown TV system #{tvSystem}"

    ###########################################################
    # Configuration reading / writing
    ###########################################################

    readConfiguration: (config) ->
        logger.info "Reading execution manager configuration"
        if config["execution"]
            @setTVSystem config["execution"]["tvSystem"]
            @setSpeed    config["execution"]["speed"]

    writeConfiguration: (config) ->
        logger.info "Writing execution manager configuration"
        config["execution"] =
            "tvSystem": @getTVSystem()
            "speed":    @getSpeed()

module.exports = ExecutionManager
