$(document).ready ->
    nesCoffee = new NESCoffee $("#video-output")[0]

    @startEmulator = ->
        nesCoffee.startEmulation()
        $("#start-emulator").addClass "hidden"
        $("#stop-emulator").removeClass "hidden"

    @stopEmulator = ->
        nesCoffee.stopEmulation()
        $("#start-emulator").removeClass "hidden"
        $("#stop-emulator").addClass "hidden"

    @setVideoScale = (scale) ->
        nesCoffee.setVideoScale scale
        $("#video-scale").prop "value", scale

    @setController = (port, device) ->
        nesCoffee.connectInputDevice 1, device
        $("#controller-" + port).prop "value", device
        $("#joypad-" + port).addClass "hidden"
        $("#zapper-" + port).addClass "hidden"
        $("#" + device + "-" + port).removeClass "hidden"

    @bindControl = bindControl = (port, device, button, srcDevice, srcButton) ->
        labelId = "#" + device + "-" + port + "-" + button
        name = nesCoffee.bindControl port, device, button, srcDevice, srcButton, -> 
            $(labelId).html "---"
        $(labelId).html name

    @recordControl = (port, device, button) ->
        $("#record-dialog").dialog { dialogClass: "record-dialog", width: 320, height: 90, modal: true, draggable: false }
        nesCoffee.recordInput (srcDevice, srcButton) ->
            bindControl port, device, button, srcDevice, srcButton
            $("#record-dialog").dialog "close"

    @setController 1, "joypad"
    @setController 2, "zapper"

    @bindControl 1, "joypad", "a", "keyboard", "x"
    @bindControl 1, "joypad", "b", "keyboard", "z"
    @bindControl 1, "joypad", "start", "keyboard", "enter"
    @bindControl 1, "joypad", "select", "keyboard", "shift"
    @bindControl 1, "joypad", "up", "keyboard", "up"
    @bindControl 1, "joypad", "down", "keyboard", "down"
    @bindControl 1, "joypad", "left", "keyboard", "left"
    @bindControl 1, "joypad", "right", "keyboard", "right"
    @bindControl 2, "zapper", "trigger", "mouse", "left"

    @setVideoScale 1
    @stopEmulator()
