###########################################################
# Adapter for zapper device
###########################################################

class ZapperAdapter

    @dependencies: [ "videoManager" ]

    constructor: (@zapper) ->

    init: (videoManager) ->
        @videoManager = videoManager

    getDevice: ->
        @zapper

    inputChanged: (input, down) ->
        if input is "trigger"
            @zapper.setTriggerPressed down

    stateChanged: (state) ->
        rect = @videoManager.getCanvasRect()
        scale = @videoManager.getScale()
        x = ~~(((state.cursorX or 0) - rect.left) / scale)
        y = ~~(((state.cursorY or 0) - rect.top) / scale)
        @zapper.setBeamPosition x, y

module.exports = ZapperAdapter
