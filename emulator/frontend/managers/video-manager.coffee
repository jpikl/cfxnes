logger = require("../../core/utils/logger").get()

VIDEO_WIDTH  = require("../../core/common/constants").VIDEO_WIDTH
VIDEO_HEIGHT = require("../../core/common/constants").VIDEO_HEIGHT

DEFAULT_DEBUGGING = false
DEFAULT_SMOOTHING = false
DEFAULT_SCALE = 1
DEFAULT_PALETTE = "default"
DEFAULT_RENDERER = "canvas"

###########################################################
# Video manager
###########################################################

class VideoManager

    @dependencies = [ "nes", "rendererFactory", "paletteFactory" ]

    ###########################################################
    # Ininitalization
    ###########################################################

    init: (nes, rendererFactory, paletteFactory) ->
        logger.info "Initializing video manager"
        @nes = nes
        @rendererFactory = rendererFactory
        @paletteFactory = paletteFactory
        @initListeners()
        @setDefaults()

    initListeners: ->
        document.addEventListener screenfull.raw.fullscreenchange, @onFullscreenChange

    setDefaults: ->
        logger.info "Using default video configuration"
        @setDebugging DEFAULT_DEBUGGING
        @setSmoothing DEFAULT_SMOOTHING
        @setScale DEFAULT_SCALE
        @setPalette DEFAULT_PALETTE
        @setRenderer DEFAULT_RENDERER

    ###########################################################
    # Canvas
    ###########################################################

    setCanvas: (canvas) ->
        logger.info "Setting video output to #{canvas}"
        @canvas = canvas
        if @canvas
            @updateCanvasSize()
            @createRenderer()
            @drawFrame()

    updateCanvasSize: ->
        widthMultiplier = if @debugging then 2 else 1
        @canvas.width = @scale * VIDEO_WIDTH * widthMultiplier
        @canvas.height = @scale * VIDEO_HEIGHT

    getCanvasRect: =>
        if @canvas and @canvas?.offsetParent isnt null # When canvas is visible
            rect = @canvas.getBoundingClientRect()
            rect.right -= VIDEO_WIDTH if @debugging # Without debugging output
            rect
        else
            { left: -1, right: -1, top: -1, bottom: -1 }

    ###########################################################
    # Renderering
    ###########################################################

    isRendererSupported: (id) ->
        @rendererFactory.isRendererSupported id

    setRenderer: (id = DEFAULT_RENDERER) ->
        logger.info "Using '#{id}' video renderer"
        @rendererId = id
        @createRenderer() if @canvas

    getRenderer: ->
        @rendererId

    createRenderer: ->
        @renderer = @rendererFactory.createRenderer @rendererId, @canvas
        @renderer.setSmoothing @smoothing
        @renderer.setScale @scale
        @frame = @renderer.createFrame 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT
        @debugFrame = @renderer.createFrame VIDEO_WIDTH, 0, VIDEO_WIDTH, VIDEO_HEIGHT

    renderFrame: ->
        @nes.renderFrame @frame.data
        @nes.renderDebugFrame @debugFrame.data if @debugging

    drawFrame: ->
        @renderer.begin()
        @renderer.drawFrame @frame
        @renderer.drawFrame @debugFrame if @debugging
        @renderer.end()

    ###########################################################
    # Palette
    ###########################################################

    setPalette: (id = DEFAULT_PALETTE) ->
        logger.info "Setting video palette to '#{id}'"
        @paletteId = id
        @nes.setRGBAPalette @paletteFactory.createPalette id

    getPalette: ->
        @paletteId

    ###########################################################
    # Debugging
    ###########################################################

    setDebugging: (enabled = DEFAULT_DEBUGGING) ->
        logger.info "Setting video debugging to #{if enabled then 'on' else 'off'}"
        @debugging = enabled
        if @canvas
            @updateCanvasSize()
            @drawFrame()

    isDebugging: ->
        @debugging

    ###########################################################
    # Smoothing
    ###########################################################

    setSmoothing: (enabled = DEFAULT_SMOOTHING) ->
        logger.info "Setting video smoothing to #{if enabled then 'on' else 'off'}"
        @smoothing = enabled
        if @canvas
            @renderer.setSmoothing enabled if @renderer
            @drawFrame()

    isSmoothing: ->
        @smoothing

    ###########################################################
    # Scalling
    ###########################################################

    setScale: (scale = DEFAULT_SCALE) ->
        logger.info "Setting video scale to #{scale}"
        @scale = scale
        if @canvas
            @updateCanvasSize()
            @renderer.setScale scale
            @drawFrame()

    getScale: ->
        @scale

    getMaxScale: ->
        ~~Math.min(screen.width / VIDEO_WIDTH, screen.height / VIDEO_HEIGHT)

    ###########################################################
    # Fullscreen
    ###########################################################

    setFullScreen: (fullscreen) ->
        if fullscreen
            @enterFullScreen()
        else
            @leaveFullScreen()

    enterFullScreen: ->
        if screenfull.enabled and not @isFullScreen()
            logger.info "Entering fullscreen"
            screenfull.request @canvas

    leaveFullScreen: ->
        if screenfull.enabled and @isFullScreen()
            logger.info "Leaving fullscreen"
            screenfull.exit()

    onFullscreenChange: =>
        logger.info "Fullscreen #{if @isFullScreen() then 'enabled' else 'disabled'}"
        if @isFullScreen()
            @prevScale = @scale
            @setScale @getMaxScale()
        else
            @setScale @prevScale
            @prevScale = null

    isFullScreen: ->
        screenfull.isFullscreen

    ###########################################################
    # Configuration reading / writing
    ###########################################################

    readConfiguration: (config) ->
        logger.info "Reading video manager configuration"
        if config["video"]
            @setDebugging config["video"]["debugging"]
            @setSmoothing config["video"]["smoothing"]
            @setScale     config["video"]["scale"]
            @setPalette   config["video"]["palette"]
            @setRenderer  config["video"]["renderer"]

    writeConfiguration: (config) ->
        logger.info "Writing video manager configuration"
        config["video"] =
            "debugging": @isDebugging()
            "smoothing": @isSmoothing()
            "scale":     @getScale()
            "palette":   @getPalette()
            "renderer":  @getRenderer()

module.exports = VideoManager
