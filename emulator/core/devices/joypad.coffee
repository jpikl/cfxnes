###########################################################
# Joypad device
###########################################################


class Joypad

    @Button:
        A:      0
        B:      1
        SELECT: 2
        START:  3
        UP:     4
        DOWN:   5
        LEFT:   6
        RIGHT:  7

    constructor: ->
        @buttonStates = (0 for [0..24])
        @buttonStates[19] = 1
        @readPosition = 0

    strobe: ->
        @readPosition = 0

    read: ->
        @buttonStates[@moveReadPosition()]

    moveReadPosition: ->
        previousPosition = @readPosition
        @readPosition = (@readPosition + 1) % 24
        previousPosition

    setButtonPressed: (button, pressed) =>
        @buttonStates[button] = +pressed

module.exports = Joypad
