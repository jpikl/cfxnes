app = angular.module "nescoffee"

app.controller "ConfigController", ($scope, emulator, stateful) ->
    stateful $scope, "config", "emulationCardOpen", false
    stateful $scope, "config", "videoCardOpen",     false
    stateful $scope, "config", "controlsCardOpen",  true

    $scope.tvSystem = emulator.getTVSystem()
    $scope.videoScale = emulator.getVideoScale()
    $scope.videoPalette = emulator.getVideoPalette()
    $scope.videoDebug = emulator.isVideoDebug()

    $scope.inputDevices =
        1: emulator.getInputDevice 1
        2: emulator.getInputDevice 2

    $scope.setTVSystem = (value) ->
        emulator.setTVSystem value

    $scope.getMaxVideoScale = ->
        emulator.getMaxVideoScale()

    $scope.setVideoScale = (value) ->
        emulator.setVideoScale value

    $scope.setVideoPalette = (value) ->
        emulator.setVideoPalette value

    $scope.setVideoDebug = (value) ->
        emulator.setVideoDebug value

    $scope.setInputDevice = (port, device) ->
        emulator.setInputDevice port, device

    $scope.setCardOpen = (name) ->
        $scope.openCard = name

    $scope.isCardOpen = (name) ->
        $scope.openCard is name
