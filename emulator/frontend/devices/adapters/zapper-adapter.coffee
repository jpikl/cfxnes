###########################################################
# Adapter for zapper device
###########################################################

class ZapperAdapter

    @dependencies: [ "videoManager" ]

    constructor: (@zapper) ->

    init: (screenManager) ->
        @screenManager = screenManager

    getDevice: ->
        @zapper

    inputChanged: (input, down) ->
        if input is "trigger"
            @zapper.setTriggerPressed down

    stateChanged: (state) ->
        rect = @videoManager.getRect()
        x = (state.cursorX or 0) - rect.left
        y = (state.cursorY or 0) - rect.top
        @zapper.setBeanPosition x, y

module.exports = ZapperAdapter
