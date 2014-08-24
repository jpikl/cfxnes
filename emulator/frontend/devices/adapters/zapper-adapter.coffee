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
        x = (state.cursorX or 0) - rect.left
        y = (state.cursorY or 0) - rect.top
        @zapper.setBeanPosition x, y

module.exports = ZapperAdapter
