$(document).ready ->

    nesCoffee = new NESCoffee "video-output"

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
        $("#video-debug").prop "value", enabled
        refreshScreen()

    @setTVSystem = (system) ->
        nesCoffee.setTVSystem system
        $("#tv-system").prop "value", system
        refreshScreen()

    refreshScreen = ->
        if nesCoffee.isCartridgeInserted() and not nesCoffee.isRunning()
            nesCoffee.step()

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

    romLoadingSuccess = ->
        document.pressPower()
        document.startEmulator() if not nesCoffee.isRunning()
        document.activeElement.blur()

    romDownloadingSuccess = ->
        $("#roms-dialog").dialog "close"
        romLoadingSuccess()

    romLoadingError = (error) ->
        alert error

    enableROMOpening = (element) ->
        nesCoffee.enableFileOpening element, romLoadingSuccess, romLoadingError

    enableROMDropping = (element) ->
        nesCoffee.enableFileDropping element, romLoadingSuccess, romLoadingError

    downloadROM = (url) ->
        nesCoffee.downloadCartridge url, romDownloadingSuccess, romLoadingError

    ###########################################################
    # Game library
    ###########################################################

    @showROMsDialog = ->
        $("#roms-dialog").dialog
            title: "Game library"
            width: 640
            modal: true
            buttons: [
                { text: "Play",  click: -> document.downloadSelectedROM() }
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
        $("#roms-dialog").dialog "option", "position", "center"

    setROMsDialogList = (files) ->
        $("#roms-dialog").empty().append "
              <div id='roms-dialog-header'>
                <label for='roms-dialog-filter'>Search: <label>
                <input id='roms-dialog-filter' type='text' onkeyup='filterROMsDialogList(this.value)'></input>
              </div>
              <ul id='roms-dialog-list'></ul>"
        document.romFiles = files
        document.romFilter = null
        refreshROMsDialogList()
        $("#roms-dialog").dialog "option", "position", "center"
        $("#roms-dialog-filter").focus()

    @filterROMsDialogList = (filter) ->
        document.romFilter = filter
        refreshROMsDialogList()

    refreshROMsDialogList = ->
        selectedFile = getSelectedROM().attr "file"
        filter = document.romFilter?.trim()?.toLowerCase() or ""
        list = $("#roms-dialog-list").empty()
        for file in document.romFiles
            name = file.replace ".nes", ""
            if filter.length is 0 or name.toLowerCase().indexOf(filter) >= 0
                list.append "<li file='#{file}' onclick='setSelectedROM(this)' ondblclick='downloadSelectedROM()'>#{name}</li>"
        $("#roms-dialog-list > li[file='" + selectedFile + "']").addClass "selected"

    @setSelectedROM = (element) ->
        getSelectedROM().removeClass "selected"
        $(element).addClass "selected"

    getSelectedROM = ->
        $("#roms-dialog-list > li.selected")

    @downloadSelectedROM = ->
        file = getSelectedROM().attr "file"
        downloadROM "roms/#{file}" if file

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
    @setTVSystem "auto"
    @stopEmulator()

    enableROMOpening "rom-file-input"
    enableROMDropping "rom-drop-area"

    nesCoffee.setPeriodicSave 60000 # 1 minute
    setInterval updateFPS, 1000
