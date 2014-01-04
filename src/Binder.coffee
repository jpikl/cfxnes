keyCodes = 
    "0": 48, "1": 49, "2": 50, "3": 51, "4": 52, "5": 53, "6": 54, "7": 55, "8": 56, "9": 57
    "a": 65, "b": 66, "c": 67, "d": 68, "e": 69, "f": 70, "g": 71, "h": 72, "i": 73, "j": 74
    "k": 75, "l": 76, "m": 77, "n": 78, "o": 79, "p": 80, "q": 81, "r": 82, "s": 83, "t": 84
    "u": 85, "v": 86, "w": 87, "x": 88, "y": 89, "z": 90
    ";": 186,  "=": 187, ",": 188, "-": 189, ".": 190, "/": 191, "`": 192, "[": 219
    "\\": 220, "]": 221, "'": 222
    "f1": 112, "f2": 113, "f3": 114, "f4": 115, "f5": 116, "f6": 117
    "f7": 118, "f8": 119, "f9": 120, "f10": 121, "f11": 122, "f12": 123
    "enter": 13, "shift": 16, "ctrl": 17, "alt": 18, "backspace": 8, "tab": 9, "escape": 27
    "left": 37, "up": 38, "right": 39, "down": 40, "delete": 46, "insert": 45, "home": 36, "end": 35
    "page-up": 33, "page-down": 34, "pause": 19, "caps-lock": 20, "num-lock": 144, "scroll-lock": 145
    "numpad-0": 96, "numpad-1": 97, "numpad-2": 98, "numpad-3": 99, "numpad-4": 100
    "numpad-5": 101, "numpad-6": 102, "numpad-7": 103, "numpad-8": 104, "numpad-9": 105
    "multiply": 106, "add": 107, "subtract": 109, "decimal-point": 110, "divide": 111

getKeyName = (key) ->
    words = key.split "-"
    words[i] = word[0].toUpperCase() + word[1..] for word, i in words when word.length > 0
    words.join " "

buttonCodes = 
    "left": 1
    "right": 2
    "middle": 3

buttonNames = 
    "left": "Left mouse button"
    "right": "Right mouse button"
    "middle": "Middle mouse button"

class Binder

    constructor: ->
        @resetState()
        @registerEventListeners()

    ###########################################################
    # Initialization
    ###########################################################

    resetState: ->
        @mouseX = 0
        @mouseY = 0
        @keyboardMapping = {}
        @mouseMapping = {}

    registerEventListeners: ->
        window.onkeydown = @onKeyDown
        window.onkeyup = @onKeyUp
        window.onmousemove = @onMouseMove
        window.onmousedown = @onMouseDown
        window.onmouseup = @onMouseUp

    ###########################################################
    # Controls binding
    ###########################################################

    bindControl: (device, button, callback) ->
        if device == "keyboard"
            @bindKeyboard button, callback
        else if device == "mouse"
            @bindMouse button, callback

    unbindControl:  (device, button) ->
        if device == "keyboard"
            @unbindKeyboard button
        else if device == "mouse"
            @unbindMouse button

    bindKeyboard: (key, callback) ->
        key = key.toLowerCase()
        @keyboardMapping[keyCodes[key]] = callback
        getKeyName key

    unbindKeyboard: (key) ->
        key = key.toLowerCase()
        @keyboardMapping[keyCodes[key]] = null

    bindMouse: (button, callback) ->
        button = button.toLowerCase()
        @mouseMapping[buttonCodes[button]] = callback
        buttonNames[button]

    unbindMouse: (button, callback) ->
        @mouseMapping[buttonCodes[button]] = null

    ###########################################################
    # Keyboard events handling
    ###########################################################

    onKeyDown: (event) =>
        @processKeyEvent event, true

    onKeyUp: (event) =>
        @processKeyEvent event, false

    processKeyEvent: (event, keyDown) ->
        event or= window.event
        keyCode = event.keyCode or event.which
        @keyboardMapping[keyCode]?(keyDown)

    ###########################################################
    # Mouse events handling
    ###########################################################

    onMouseMove: (event) =>
        event or= window.event
        @mouseX = event.clientX
        @mouseY = event.clientY

    onMouseDown: (event) =>
        @processMouseEvent event, true

    onMouseUp: (event) =>
        @processMouseEvent event, false

    processMouseEvent: (event, buttonDown) ->
        event or= window.event
        button = event.button or event.which
        @mouseMapping[button]?(buttonDown)

module.exports = Binder
