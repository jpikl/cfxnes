angular.module "nescoffee"

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

    $scope.controls = globalParams.controlsConfig ?= {}
    $scope.controls.visible ?= true
    $scope.controls.devices =
        1: emulator.getInputDevice(1) or "none"
        2: emulator.getInputDevice(2) or "none"

    if $stateParams.section
        $scope.emulation.visible = $stateParams.section is "emulation"
        $scope.video.visible = $stateParams.section is "video"
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

    $scope.$watch "controls.devices[1]", (value) ->
        emulator.setInputDevice 1, value unless emulator.getInputDevice(1) is value

    $scope.$watch "controls.devices[2]", (value) ->
        emulator.setInputDevice 2, value unless emulator.getInputDevice(2) is value

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
        $scope.controls.devices[1] = emulator.getInputDevice(1) or "none"
        $scope.controls.devices[2] = emulator.getInputDevice(2) or "none"
