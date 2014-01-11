$(document).ready ->
    nesCoffee = new NESCoffee $("#video-output")[0]

    ###########################################################
    # Emulation
    ###########################################################

    @startEmulator = ->
        nesCoffee.start()
        $("#start-emulator").addClass "hidden"
        $("#stop-emulator").removeClass "hidden"
        updateFPS()

    @stopEmulator = ->
        nesCoffee.stop()
        $("#start-emulator").removeClass "hidden"
        $("#stop-emulator").addClass "hidden"
        updateFPS()

    @pressPower = ->
        nesCoffee.pressPower()

    @pressReset = ->
        nesCoffee.pressReset()

    @setVideoScale = (scale) ->
        nesCoffee.setVideoScale scale
        $("#video-scale").prop "value", scale

    updateFPS = ->
        fps = if nesCoffee.isRunning() then "#{~~nesCoffee.getFPS()}" else "--"
        fps = " " + fps if fps.length == 1
        $("#fps-value").html fps

    @setVideoDebug = (enabled) ->
        nesCoffee.setVideoDebug enabled

    ###########################################################
    # Controllers selection & binding
    ###########################################################

    @setController = (port, device) ->
        nesCoffee.connectInputDevice port, device
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

    ###########################################################
    # ROM loading
    ###########################################################

    @allowFileDrop = (event) ->
        event.preventDefault()  # Disable default action (opening file in the browser).
        event.stopPropagation() # Disable parent elements notification.
        event.dataTransfer.dropEffect = 'copy' # Changes cursor to show we are copying file.

    @handleDroppedFile = (event) ->
        event.preventDefault()
        event.stopPropagation()
        file = event.dataTransfer.files[0]
        insertCartridgeAsFile file if file

    @handleSelectedFile = (event) ->
        file = event.target.files[0]
        insertCartridgeAsFile file if file

    insertCartridgeAsFile = (file) ->
        reader = new FileReader
        reader.onload = (event) -> insertCartridge event.target.result
        reader.onerror = (event) -> alert event.target.error
        reader.readAsArrayBuffer file

    insertCartridge = (arrayBuffer) ->
        try
            nesCoffee.insertCartridge arrayBuffer
            nesCoffee.pressPower()
        catch error
            alert error

    ###########################################################
    # Initialization
    ###########################################################

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

    setInterval updateFPS, 1000
