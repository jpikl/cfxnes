buttonAliases =
    1: "left"
    2: "right"
    3: "middle"
    4: "middle"

###########################################################
# Mouse event handler
###########################################################

class Mouse

    @dependencies: [ "inputManager" ]

    constructor: (@id) ->

    init: (inputManager) ->
        @inputManager = inputManager
        window.addEventListener "mousemove", @onMouseMove
        window.addEventListener "mousedown", @onMouseDown
        window.addEventListener "mouseup", @onMouseUp

    onMouseMove: (event) =>
        event or= window.event
        @x = event.clientX
        @y = event.clientY

    onMouseDown: (event) =>
        @processEvent event, true

    onMouseUp: (event) =>
        @processEvent event, false

    processEvent: (event, down) ->
        event or= window.event
        button = event.button or event.which
        input = buttonAliases[button]
        if input and @inputManager.processInput @id, input, down
            event.preventDefault()

    readState: (state) ->
        state.cursorX = @x
        state.cursorY = @y

    getInputName: (input) ->
        input[0].toUpperCase() + input[1..] + " mouse button"

module.exports = Mouse
