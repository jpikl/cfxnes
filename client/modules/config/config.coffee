app = angular.module "nescoffee"

app.controller "ConfigController", ($scope, $modal, emulator, transfer) ->
    $scope.emulation = transfer.emulationConfig ?= {}
    $scope.emulation.visible ?= false
    $scope.emulation.tvSystem = emulator.getTVSystem()

    $scope.video = transfer.videoConfig ?= {}
    $scope.video.visible ?= false
    $scope.video.scale = emulator.getVideoScale()
    $scope.video.maxScale = emulator.getMaxVideoScale()
    $scope.video.palette = emulator.getVideoPalette()
    $scope.video.debug = emulator.isVideoDebug()

    $scope.controls = transfer.controlsConfig ?= {}
    $scope.controls.visible ?= true
    $scope.controls.devices =
        1: emulator.getInputDevice 1
        2: emulator.getInputDevice 2

    $scope.$watch "emulation.tvSystem", (value) ->
        emulator.setTVSystem value

    $scope.$watch "video.scale", (value) ->
        emulator.setVideoScale value

    $scope.$watch "video.palette", (value) ->
        emulator.setVideoPalette value

    $scope.$watch "video.debug", (value) ->
        emulator.setVideoDebug value

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
        $scope.controls.devices[1] = emulator.getInputDevice 1
        $scope.controls.devices[2] = emulator.getInputDevice 2
