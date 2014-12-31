angular.module "cfxnes"

.controller "EmulatorController", ($scope, $state, emulator, globalParams) ->

    $scope.loadCartridge = (file) ->
        onLoad  =         -> $scope.$parent.$broadcast "cartridgeLoad"
        onError = (error) -> $scope.$parent.$broadcast "cartridgeError", error
        emulator.loadCartridge file, onLoad, onError

    $scope.clearError = ->
        $scope.error = null

    $scope.setVideoOutput = (element) ->
        emulator.setVideoOutput element[0]
        emulator.step() if emulator.isCartridgeInserted() # To redraw screen

    $scope.changeControlsUrl = $state.href "config", { section: "controls" }

    $scope.controlsVisible = globalParams.controlsVisible ?= true

    $scope.hideControls = ->
        $scope.controlsVisible = globalParams.controlsVisible = false

    $scope.getMappedInputName = (device, input) ->
        if emulator.getInputDevice(1) is device
            emulator.getMappedInputName(1, device, input) or "--"
        else if emulator.getInputDevice(2) is device
            emulator.getMappedInputName(2, device, input) or "--"
        else
            "--"

    $scope.$on "cartridgeLoad", ->
        $scope.error = null
        emulator.start()

    $scope.$on "cartridgeError", (event, error) ->
        $scope.error = error
        emulator.stop()

    $scope.$on "$stateChangeStart", ->
        emulator.stop()
        emulator.setVideoOutput null # Drop the canvas
