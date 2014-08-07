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
    $scope.video.debug = emulator.isVideoDebug()
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
        emulator.setTVSystem value

    $scope.$watch "video.scale", (value) ->
        emulator.setVideoScale value

    $scope.$watch "video.palette", (value) ->
        emulator.setVideoPalette value

    $scope.$watch "video.debug", (value) ->
        emulator.setVideoDebug value

    $scope.$watch "video.smoothing", (value) ->
        emulator.setVideoSmoothing value

    $scope.$watch "controls.devices[1]", (value) ->
        emulator.setInputDevice 1, value

    $scope.$watch "controls.devices[2]", (value) ->
        emulator.setInputDevice 2, value

    $scope.getControl = (dstPort, dstDevice, dstButton) ->
        emulator.getControl(dstPort, dstDevice, dstButton) or "--"

    $scope.bindControl = (dstPort, dstDevice, dstButton) ->
        modal = $modal.open
            template: "Press key or mouse button..."
            windowClass: "bind-modal-window"
        emulator.recordInput (srcDevice, srcButton) ->
            modal.close()
            emulator.bindControl dstPort, dstDevice, dstButton, srcDevice, srcButton
            $scope.$apply()
            document.activeElement.blur()

    $scope.useDefaultControls = ->
        emulator.useDefaultControls()
        $scope.controls.devices[1] = emulator.getInputDevice(1) or "none"
        $scope.controls.devices[2] = emulator.getInputDevice(2) or "none"
