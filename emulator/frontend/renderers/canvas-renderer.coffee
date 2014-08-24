VIDEO_WIDTH  = require("../../core/common/constants").VIDEO_WIDTH
VIDEO_HEIGHT = require("../../core/common/constants").VIDEO_HEIGHT

###########################################################
# Renderer using canvas API
###########################################################

class CanavsRenderer

    constructor: (@canvas) ->
        @context = @canvas.getContext "2d"
        @scale = 1
        @smoothing = false

    createBuffer: (width, height) ->
        buffer = @context.createImageData width, height
        for i in [0...buffer.data.length]
            buffer.data[i] = if (i & 0x03) != 0x03 then 0x00 else 0xFF # RGBA = 000000FF
        buffer

    drawBuffer: (buffer, x, y) ->
        @context.putImageData buffer, x, y

    flush: ->
        if @scale > 1
            @applySmoothing() if smoothing
            @appyScaling()

    setScale: (scale) ->
        @scale = scale

    appyScaling: ->
        sw = VIDEO_WIDTH
        sh = VIDEO_HEIGHT
        dw = @canvas.width
        dh = @canvas.height
        @renderer.drawImage @canvas, 0, 0, sw, sh, 0, 0, dw, dh

    setSmoothing: (smoothing) ->
        @smoothing = smoothing

    applySmoothing: ->
        @context["imageSmoothingEnabled"] = @videoSmoothing
        @context["mozImageSmoothingEnabled"] = @videoSmoothing
        @context["oImageSmoothingEnabled"] = @videoSmoothing
        @context["webkitImageSmoothingEnabled"] = @videoSmoothing
        @context["msImageSmoothingEnabled"] = @videoSmoothing

module.exports = CanavsRenderer
