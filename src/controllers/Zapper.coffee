class Zapper

    constructor: ->
        @triggerState = 0
        @detectorState = 0

    strobe: ->

    read: ->
        @triggerState << 4 | !@detectorState << 3

    setTriggerPressed: (pressed) =>
        @triggerState = pressed

    setLightDetected: (detected) ->
        @detectorState = detected

module.exports = Zapper
