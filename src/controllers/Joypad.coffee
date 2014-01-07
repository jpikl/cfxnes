class Joypad

    @BUTTON_A: 0
    @BUTTON_B: 1
    @BUTTON_SELECT: 2
    @BUTTON_START: 3
    @BUTTON_UP: 4
    @BUTTON_DOWN: 5
    @BUTTON_LEFT: 6
    @BUTTON_RIGHT: 7

    constructor: ->
        @buttonStates = (0 for [0..24])
        @buttonStates[19] = 1
        @readPosition = 0

    strobe: ->
        @readPosition = 0

    read: ->
        @buttonStates[@moveReadPosition()]

    moveReadPosition: ->
        previsousPosition = @readPosition
        @readPosition = (@readPosition + 1) % 24
        previsousPosition

    setButtonPressed: (button, pressed) =>
        @buttonStates[button] = +pressed

module.exports = Joypad
