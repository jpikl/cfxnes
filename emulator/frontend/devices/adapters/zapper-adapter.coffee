Zapper = require "../../../core/devices/Zapper"

###########################################################
# Adapter for zapper device
###########################################################

class ZapperAdapter

    constructor: (injector) ->
        @zapper = injector.injectInstance new Zapper

    getAdaptee: ->
        @zapper

    inputChanged: (input, down) ->
        if input is "trigger"
            @zapper.setTriggerPressed down

    inputBroadcasted: (input, data) ->
        if input is "cursor-position"
            @zapper.setBeanPosition data.x, data.y

module.exports = ZapperAdapter
