keyCodeToName = 
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

buttonNumberToName = 
    1: "left"
    2: "right"
    3: "middle"
    4: "middle"

getKeyDescription = (key) ->
        words = key.split "-"
        words[i] = word[0].toUpperCase() + word[1..] for word, i in words when word.length > 0
        words.join " "

getButtonDescription = (button) ->
    button[0].toUpperCase() + button[1..] + " mouse button"

class Binder

    constructor: (@getMouseRect) ->
        @resetState()
        @registerEventListeners()

    ###########################################################
    # Initialization
    ###########################################################

    resetState: ->
        @mouseX = 0
        @mouseY = 0
        @recordNextEvent = no
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
        @keyboardMapping[key.toLowerCase()] = callback
        getKeyDescription key.toLowerCase()

    unbindKeyboard: (key) ->
        @keyboardMapping[key.toLowerCase()] = null

    bindMouse: (button, callback) ->
        @mouseMapping[button.toLowerCase()] = callback
        getButtonDescription button.toLowerCase()

    unbindMouse: (button) ->
        @mouseMapping[button.toLowerCase()] = null

    ###########################################################
    # Input recording
    ###########################################################

    recordInput: (callback) ->
        @recordNextEvent = yes
        @recordCallback = callback

    finishRecording: (device, button) ->
        @recordNextEvent = no
        @recordCallback device, button

    ###########################################################
    # Keyboard events handling
    ###########################################################

    onKeyDown: (event) =>
        @processKeyEvent event, true

    onKeyUp: (event) =>
        @processKeyEvent event, false

    processKeyEvent: (event, keyDown) ->
        event or= window.event
        key = keyCodeToName[event.keyCode or event.which] or "unknown"
        if @recordNextEvent
            event.preventDefault()
            @finishRecording "keyboard", key
        else if @keyboardMapping[key]
            event.preventDefault()
            @keyboardMapping[key](keyDown)


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
        button = buttonNumberToName[event.button or event.which] or "unknown"
        if @recordNextEvent
            event.preventDefault()
            @finishRecording "mouse", button
        else if @mouseMapping[button] and @isMouseInActiveArea()
            event.preventDefault()
            @mouseMapping[button](buttonDown)

    isMouseInActiveArea: ->
        rect = @getMouseRect()
        @mouseX >= rect.left and @mouseX <= rect.right and
        @mouseY >= rect.top  and @mouseY <= rect.bottom


module.exports = Binder
