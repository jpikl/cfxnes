angular.module "nescoffee"

.controller "EmulatorController", ($scope, $state, emulator, globalParams) ->
    emulator.onLoad = ->
        $scope.error = null
        emulator.start()

    emulator.onError = (error) ->
        $scope.error = error
        emulator.stop()

    $scope.loadCartridge = (file) ->
        emulator.loadCartridge file

    $scope.clearError = ->
        $scope.error = null

    $scope.setVideoOutput = (element) ->
        emulator.setVideoOutput element[0]

    $scope.controlsVisible = globalParams.controlsVisible ?= true

    $scope.hideControls = ->
        $scope.controlsVisible = globalParams.controlsVisible = false

    $scope.getControl = (device, button) ->
        if emulator.getInputDevice(1) is device
            emulator.getControl(1, device, button) or "--"
        else if emulator.getInputDevice(2) is device
            emulator.getControl(2, device, button) or "--"
        else
            "--"

    $scope.changeControlsUrl = $state.href "config", { section: "controls" }

    $scope.$on "$stateChangeStart", ->
        emulator.stop()
