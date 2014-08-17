keyCodeAliases =
    48: "0", 49: "1", 50: "2", 51: "3", 52: "4", 53: "5", 54: "6", 55: "7", 56: "8", 57: "9"
    65: "a", 66: "b", 67: "c", 68: "d", 69: "e", 70: "f", 71: "g", 72: "h", 73: "i", 74: "j"
    75: "k", 76: "l", 77: "m", 78: "n", 79: "o", 80: "p", 81: "q", 82: "r", 83: "s", 84: "t"
    85: "u", 86: "v", 87: "w", 88: "x", 89: "y", 90: "z"
    186: ";",  187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "["
    220: "\\", 221: "]", 222: "'"
    112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6"
    118: "f7", 119: "f8", 120: "f9", 121: "f10", 122: "f11", 123: "f12"
    13: "enter", 16: "shift", 17: "ctrl", 18: "alt", 8: "backspace", 9: "tab", 27: "escape", 32: "space"
    37: "left", 38: "up", 39: "right", 40: "down", 46: "delete", 45: "insert", 36: "home", 35: "end"
    33: "page-up", 34: "page-down", 19: "pause", 20: "caps-lock", 144: "num-lock", 145: "scroll-lock"
    96: "numpad-0", 97: "numpad-1", 98: "numpad-2", 99: "numpad-3", 100: "numpad-4"
    101: "numpad-5", 102: "numpad-6", 103: "numpad-7", 104: "numpad-8", 105: "numpad-9"
    106: "multiply", 107: "add", 109: "subtract", 110: "decimal-point", 111: "divide"

###########################################################
# Keyboard event handler
###########################################################

class Keyboard

    @dependencies: [ "inputManager" ]

    constructor: (@id) ->

    init: (inputManager) ->
        @inputManager = inputManager
        window.addEventListener "keydown", @onKeyDown
        window.addEventListener "keyup", @onKeyUp

    onKeyDown: (event) =>
        @processEvent event, true

    onKeyUp: (event) =>
        @processEvent event, false

    processEvent: (event, down) ->
        event or= window.event
        keyCode = event.keyCode or event.which
        input = keyCodeAliases[keyCode]
        if input and @inputManager.processInput @id, input, down
            event.preventDefault()

    getInputName: (input) ->
        words = input.split "-"
        words[i] = word[0].toUpperCase() + word[1..] for word, i in words when word.length > 0
        words.join " "

module.exports = Keyboard
