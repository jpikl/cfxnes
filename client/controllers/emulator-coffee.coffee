angular.module "nescoffee"

.controller "EmulatorController", ($scope, $state, emulator, globalParams) ->
    $scope.$on "$stateChangeStart", ->
        emulator.stop()

    $scope.$on "$stateChangeSuccess", ->
        $("#file-upload").on "change", (event) ->
            document.activeElement.blur()
            event.preventDefault()
            event.stopPropagation()
            emulator.loadCartridge event.target.files[0]
        $("#file-drop").on "dragover", (event) ->
            event.preventDefault()
            event.stopPropagation()
            event.dataTransfer.dropEffect = "copy"
        $("#file-drop").on "drop", (event) ->
            event.preventDefault()
            event.stopPropagation()
            emulator.loadCartridge event.dataTransfer.files[0]

    emulator.onError = (error) ->
        $scope.error = error
        emulator.stop()

    emulator.onLoad = ->
        $scope.error = null
        emulator.start()

    $scope.clearError = ->
        $scope.error = null

    $scope.configInfoVisible = globalParams.configInfoVisible ?= true

    $scope.hideConfigInfo = ->
        $scope.configInfoVisible = globalParams.configInfoVisible = false

    $scope.getControl = (device, button) ->
        if emulator.getInputDevice(1) is device
            emulator.getControl(1, device, button) or "--"
        else if emulator.getInputDevice(2) is device
            emulator.getControl(2, device, button) or "--"
        else
            "--"
    $scope.setVideoOutput = (element) ->
        emulator.setVideoOutput element[0]

    $scope.changeControlsURL = $state.href "config", { section: "controls" }
