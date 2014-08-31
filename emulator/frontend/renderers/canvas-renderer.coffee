VIDEO_WIDTH  = require("../../core/common/constants").VIDEO_WIDTH
VIDEO_HEIGHT = require("../../core/common/constants").VIDEO_HEIGHT

###########################################################
# Renderer using canvas API
###########################################################

class CanavsRenderer

    constructor: (@canvas) ->
        @context = @canvas.getContext "2d"
        @smoothing = false
        @scale = 1

    createBuffer: (width, height) ->
        buffer = @context.createImageData width, height
        for i in [0...buffer.data.length]
            buffer.data[i] = if (i & 0x03) != 0x03 then 0x00 else 0xFF # RGBA = 000000FF
        buffer

    drawBuffer: (buffer, x, y) ->
        @context.putImageData buffer, x, y

    flush: ->
        if @scale > 1
            @applySmoothing() if @smoothing
            @appyScaling()

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
        sw = VIDEO_WIDTH
        sh = VIDEO_HEIGHT
        dw = @canvas.width
        dh = @canvas.height
        @context.drawImage @canvas, 0, 0, sw, sh, 0, 0, dw, dh

module.exports = CanavsRenderer
