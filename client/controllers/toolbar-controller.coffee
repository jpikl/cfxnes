angular.module "cfxnes"

.controller "ToolbarController", ($scope, emulator) ->
    $scope.loadCartridge = (file) ->
        onLoad = -> $scope.$parent.$broadcast "cartridgeLoadSuccess"
        onError = (error) -> $scope.$parent.$broadcast "cartridgeLoadError", error
        emulator.loadCartridge file, onLoad, onError

    $scope.isRunning = ->
        emulator.isRunning()

    $scope.start = ->
        emulator.start()

    $scope.stop = ->
        emulator.stop()

    $scope.hardReset = ->
        emulator.hardReset()

    $scope.softReset = ->
        emulator.softReset()

    $scope.decreaseSize = ->
        unless $scope.isMinSize()
            scale = emulator.getVideoScale()
            emulator.setVideoScale scale - 1

    $scope.increaseSize = ->
        unless $scope.isMaxSize()
            scale = emulator.getVideoScale()
            emulator.setVideoScale scale + 1

    $scope.isMinSize = ->
        emulator.getVideoScale() is 1

    $scope.isMaxSize = ->
        emulator.getVideoScale() is emulator.getMaxVideoScale()

    $scope.enterFullScreen = ->
        emulator.enterFullScreen()

    $scope.audioSupported = emulator.isAudioSupported()
    $scope.audioEnabled = emulator.isAudioEnabled()
    $scope.audioVolume = ~~(100 * emulator.getAudioVolume())

    $scope.$watch "audioEnabled", (value) ->
        emulator.setAudioEnabled value unless emulator.isAudioEnabled() is value

    $scope.$watch "audioVolume", (value) ->
        emulator.setAudioVolume value / 100 unless ~~(100 * emulator.getAudioVolume()) is value

    $scope.percentageFormater = (value) ->
        "#{value}%"

    $scope.preventClose = (event) ->
        event.stopPropagation()

    $scope.getFPS = ->
        ~~emulator.getFPS()

    refreshScope = -> $scope.$apply()
    setInterval refreshScope, 1000
