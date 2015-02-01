angular.module "cfxnes"

.controller "ConfigController", ($scope, $stateParams, $modal, emulator, globalParams) ->
    $scope.emulation = globalParams.emulationConfig ?= {}
    $scope.emulation.visible ?= false
    $scope.emulation.tvSystem = emulator.getTVSystem() or "auto"

    $scope.video = globalParams.videoConfig ?= {}
    $scope.video.visible ?= false
    $scope.video.scale = emulator.getVideoScale()
    $scope.video.maxScale = emulator.getMaxVideoScale()
    $scope.video.palette = emulator.getVideoPalette()
    $scope.video.webGL = emulator.getVideoRenderer() is "webgl"
    $scope.video.webGLSupported = emulator.isVideoRendererSupported "webgl"
    $scope.video.debugging = emulator.isVideoDebugging()
    $scope.video.smoothing = emulator.isVideoSmoothing()

    $scope.audio = globalParams.audioConfig ?= {}
    $scope.audio.visible ?= false
    $scope.audio.enabled = emulator.isAudioEnabled()
    $scope.audio.volume = ~~(100 * emulator.getAudioVolume())
    $scope.audio.channels = {}
    $scope.audio.channels[channel] = emulator.isAudioChannelEnabled channel for channel in emulator.audioChannels

    $scope.controls = globalParams.controlsConfig ?= {}
    $scope.controls.visible ?= true
    $scope.controls.devices = {}
    $scope.controls.devices[port] = emulator.getInputDevice(port) or "none" for port in emulator.inputPorts

    if $stateParams.section
        $scope.emulation.visible = $stateParams.section is "emulation"
        $scope.video.visible = $stateParams.section is "video"
        $scope.audio.visible = $stateParams.section is "audio"
        $scope.controls.visible = $stateParams.section is "controls"

    $scope.$watch "emulation.tvSystem", (value) ->
        emulator.setTVSystem value unless emulator.getTVSystem() is value

    $scope.$watch "video.scale", (value) ->
        emulator.setVideoScale value unless emulator.getVideoScale() is value

    $scope.$watch "video.palette", (value) ->
        emulator.setVideoPalette value unless emulator.getVideoPalette() is value

    $scope.$watch "video.webGL", (value) ->
        renderer = if value then "webgl" else "canvas"
        emulator.setVideoRenderer renderer unless emulator.getVideoRenderer() is renderer

    $scope.$watch "video.debugging", (value) ->
        emulator.setVideoDebugging value unless emulator.isVideoDebugging() is value

    $scope.$watch "video.smoothing", (value) ->
        emulator.setVideoSmoothing value unless emulator.isVideoSmoothing() is value

    $scope.$watch "audio.enabled", (value) ->
        emulator.setAudioEnabled value unless emulator.isAudioEnabled() is value

    $scope.$watch "audio.volume", (value) ->
        emulator.setAudioVolume value / 100 unless ~~(100 * emulator.getAudioVolume()) is value

    for channel in emulator.audioChannels
        $scope.$watch "audio.channels.#{channel}", ((channel) -> (value) ->
            emulator.setAudioChannelEnabled channel, value unless emulator.isAudioChannelEnabled(channel) is value
        )(channel)

    for port in emulator.inputPorts
        $scope.$watch "controls.devices[#{port}]", ((port) -> (value) ->
            emulator.setInputDevice port, value unless emulator.getInputDevice(port) is value
        )(port)

    $scope.percentageFormater = (value) ->
        "#{value}%"

    $scope.getMappedInputName = (targetPort, targetId, targetInput) ->
        emulator.getMappedInputName(targetPort, targetId, targetInput) or "--"

    $scope.recordInput = (targetPort, targetId, targetInput) ->
        modal = $modal.open
            template: "Press key or mouse button..."
            windowClass: "modal-record-input"
            keyboard: false
        emulator.recordInput (sourceId, sourceInput) ->
            modal.close()
            if sourceId isnt "keyboard" or sourceInput isnt "escape"
                emulator.mapInput targetPort, targetId, targetInput, sourceId, sourceInput
                $scope.$apply()

    $scope.restoreDefaults = ->
        emulator.setInputDefaults()
        $scope.controls.devices[port] = emulator.getInputDevice(port) or "none" for port in emulator.inputPorts
