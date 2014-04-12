$(document).ready ->

    nesCoffee = new NESCoffee $("#video-output")[0]

    ###########################################################
    # Emulation
    ###########################################################

    @startEmulator = =>
        nesCoffee.start()
        setVisible $("#start-emulator"), false
        setVisible $("#stop-emulator"), true
        updateFPS()

    @stopEmulator = ->
        nesCoffee.stop()
        setVisible $("#start-emulator"), true
        setVisible $("#stop-emulator"), false
        updateFPS()

    updateFPS = ->
        fps = if nesCoffee.isRunning() then "#{~~nesCoffee.getFPS()}" else "--"
        fps = " " + fps if fps.length == 1
        $("#fps-value").html fps

    @pressPower = ->
        nesCoffee.pressPower()

    @pressReset = ->
        nesCoffee.pressReset()

    @setVideoScale = (scale) ->
        nesCoffee.setVideoScale scale
        $("#video-scale").prop "value", scale

    @setVideoPalette = (palette) ->
        nesCoffee.setVideoPalette palette
        $("#video-palette").prop "value", palette
        refreshScreen()

    @setVideoDebug = (enabled) ->
        nesCoffee.setVideoDebug enabled
        refreshScreen()

    refreshScreen = ->
        nesCoffee.step() if not nesCoffee.isRunning()

    ###########################################################
    # Controls
    ###########################################################

    @setController = (port, device) ->
        nesCoffee.setInputDevice port, device
        $("#controller-" + port).prop "value", device
        setVisible $("#joypad-" + port), device == "joypad"
        setVisible $("#zapper-" + port), device == "zapper"
        useClass $("#video-output"), "zapper-area", isZapperConnected()

    isZapperConnected = ->
        device1 = nesCoffee.getInputDevice 1
        device2 = nesCoffee.getInputDevice 2
        device1 is "zapper" or device2 is "zapper"

    @bindControl = bindControl = (port, device, button, srcDevice, srcButton) ->
        labelId = "#" + device + "-" + port + "-" + button
        name = nesCoffee.bindControl port, device, button, srcDevice, srcButton, ->
            $(labelId).html "---"
        $(labelId).html name

    @recordControl = (port, device, button) ->
        $("#record-dialog").dialog
            dialogClass: "record-dialog"
            width: 320, height: 90
            modal: true, draggable: false
        resumeEmulator = @startEmulator if nesCoffee.isRunning()
        @stopEmulator()
        nesCoffee.recordInput (srcDevice, srcButton) ->
            bindControl port, device, button, srcDevice, srcButton
            $("#record-dialog").dialog "close"
            resumeEmulator?()

    ###########################################################
    # ROM loading
    ###########################################################

    @allowFileDrop = (event) ->
        event.preventDefault()
        event.stopPropagation()
        event.dataTransfer.dropEffect = 'copy'

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
            document.pressPower()
            document.startEmulator() if not nesCoffee.isRunning()
        catch error
            alert error

    ###########################################################
    # ROMS library
    ###########################################################

    @showROMsDialog = ->
        $("#roms-dialog").dialog
            title: "Game library"
            width: 640, height: 480
            modal: true
            buttons: [
                { text: "Play",  click: -> downloadSelectedROM() }
                { text: "Close", click: -> $(this).dialog "close" }
            ]
        downloadROMsList()

    downloadROMsList = ->
        setROMsDialogMessage "Downloading game list..."
        $.getJSON("roms/")
            .fail(-> setROMsDialogMessage "Error: Unable to download game list!")
            .done((data) -> setROMsDialogList data)

    setROMsDialogMessage = (message) ->
        $("#roms-dialog").empty().append "<p id='roms-dialog-message'>#{message}</p>"

    setROMsDialogList = (files) ->
        $("#roms-dialog").empty().append("<select id='roms-dialog-list' size='3'></select>")
        list = $("#roms-dialog-list")
        list.append "<option name='#{file}'>#{getROMName file}</option>" for file in files

    getROMName = (file) ->
        file.replace ".nes", ""

    downloadSelectedROM = ->
        list = $("#roms-dialog-list")
        file = $(list.prop("options")[list.prop "selectedIndex"]).attr "name"
        downloadROMFile "roms/#{file}"

    downloadROMFile = (file) ->
        request = new XMLHttpRequest
        request.open "GET", file, true
        request.responseType = "arraybuffer";
        request.onload = ->
            if @status == 200
                insertCartridge new Uint8Array @response
                $("#roms-dialog").dialog "close"
            else
                alert "Unable to download selected ROM."
        request.send()

    ###########################################################
    # Utilities
    ###########################################################

    useClass = (jquery, name, use) ->
        if use
            jquery.addClass name
        else
            jquery.removeClass name

    setVisible = (jquery, visible) ->
        useClass jquery, "hidden", not visible

    ###########################################################
    # Initialization
    ###########################################################

    @setController 1, "joypad"
    @setController 2, "zapper"

    @bindControl 1, "joypad", "a", "keyboard", "c"
    @bindControl 1, "joypad", "b", "keyboard", "x"
    @bindControl 1, "joypad", "start", "keyboard", "enter"
    @bindControl 1, "joypad", "select", "keyboard", "shift"
    @bindControl 1, "joypad", "up", "keyboard", "up"
    @bindControl 1, "joypad", "down", "keyboard", "down"
    @bindControl 1, "joypad", "left", "keyboard", "left"
    @bindControl 1, "joypad", "right", "keyboard", "right"
    @bindControl 2, "zapper", "trigger", "mouse", "left"

    @setVideoScale 1
    @setVideoPalette "default"
    @stopEmulator()

    setInterval updateFPS, 1000
