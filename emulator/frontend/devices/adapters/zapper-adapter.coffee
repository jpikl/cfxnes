VIDEO_WIDTH  = require("../../../core/common/constants").VIDEO_WIDTH
VIDEO_HEIGHT = require("../../../core/common/constants").VIDEO_HEIGHT

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
        rect = @videoManager.getOutputRect()
        horizontalScale = (rect.right - rect.left) / VIDEO_WIDTH
        verticalScale = (rect.bottom - rect.top) / VIDEO_HEIGHT
        x = ~~(((state.cursorX or 0) - rect.left) / horizontalScale)
        y = ~~(((state.cursorY or 0) - rect.top) / verticalScale)
        @zapper.setBeamPosition x, y

module.exports = ZapperAdapter
