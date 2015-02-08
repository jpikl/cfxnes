angular.module "cfxnes"

.controller "EmulatorController", ($scope, $state, $stateParams, emulator, library, globalParams) ->

    $scope.emulator = emulator

    $scope.loadCartridge = (file) ->
        onLoad = -> $scope.$broadcast "cartridgeLoadSuccess"
        onError = (error) -> $scope.$broadcast "cartridgeLoadError", error
        emulator.loadCartridge file, onLoad, onError

    $scope.clearError = ->
        $scope.error = null

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

    $scope.$on "cartridgeLoadStart", ->
        emulator.removeCartridge()
        emulator.stop()
        $scope.loading = true
        $scope.error = null

    $scope.$on "cartridgeLoadSuccess", (gameId) ->
        globalParams.gameId = gameId
        $scope.loading = false
        emulator.start()

    $scope.$on "cartridgeLoadError", (event, error) ->
        $scope.loading = false
        $scope.error = error

    $scope.$on "$stateChangeStart", ->
        globalParams.autoPaused = emulator.isRunning()
        emulator.stop()
        emulator.setVideoOutput null # Drop the canvas

     if $stateParams.gameId and $stateParams.gameId isnt globalParams.gameId
        $scope.$broadcast "cartridgeLoadStart"
        library.getROMFile $stateParams.gameId
            .then (response) ->
                try
                    emulator.insertCartridge response.data
                    $scope.$broadcast "cartridgeLoadSuccess", $stateParams.gameId
                catch error
                    $scope.$broadcast "cartridgeLoadError", error or "Internal error"
            .catch (response) ->
                $scope.$broadcast "cartridgeLoadError", "Unable to download file (server response: #{response.status})"
    else if globalParams.autoPaused
        emulator.start()
