app = angular.module "nescoffee"

app.controller "ConfigController", ($scope, emulator, transfer) ->
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
