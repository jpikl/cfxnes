colors = require "../../core/utils/colors"

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
        imageData = @context.createImageData width, height
        data = new Uint32Array imageData.data.buffer
        data[i] = colors.BLACK for i in [0...data.length]
        {
            x: x
            y: y
            data: data
            imageData: imageData
        }

    drawFrame: (frame) ->
        @context.putImageData frame.imageData, frame.x, frame.y

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
