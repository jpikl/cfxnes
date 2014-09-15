###########################################################
# Renderer using canvas API
###########################################################

class CanavsRenderer

    @isSupported: ->
        true

    constructor: (@canvas) ->
        @context = @canvas.getContext "2d"
        @initParameters()

    ###########################################################
    # Frames
    ###########################################################

    createFrame: (x, y, width, height) ->
        frame = @context.createImageData width, height
        frame.x = x
        frame.y = y
        for i in [0...frame.data.length]
            frame.data[i] = if (i & 0x03) != 0x03 then 0x00 else 0xFF # RGBA = 000000FF
        frame

    drawFrame: (frame) ->
        @context.putImageData frame, frame.x, frame.y

    ###########################################################
    # Begin / End
    ###########################################################

    begin: ->

    end: ->
        if @scale > 1
            @applySmoothing()
            @appyScaling()

    ###########################################################
    # Parameters
    ###########################################################

    initParameters: ->
        @smoothing = false
        @scale = 1

    setSmoothing: (smoothing) ->
        @smoothing = smoothing

    applySmoothing: ->
        @context["imageSmoothingEnabled"] = @smoothing
        @context["mozImageSmoothingEnabled"] = @smoothing
        @context["oImageSmoothingEnabled"] = @smoothing
        @context["webkitImageSmoothingEnabled"] = @smoothing
        @context["msImageSmoothingEnabled"] = @smoothing

    setScale: (scale) ->
        @scale = scale

    appyScaling: ->
        sw = @canvas.width / @scale
        sh = @canvas.height / @scale
        dw = @canvas.width
        dh = @canvas.height
        @context.drawImage @canvas, 0, 0, sw, sh, 0, 0, dw, dh

module.exports = CanavsRenderer
