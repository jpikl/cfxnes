angular.module "nescoffee"

.controller "ToolbarController", ($scope, emulator) ->
    $scope.loadCartridge = (file) ->
        onLoad  =         -> $scope.$parent.$broadcast "cartridgeLoad"
        onError = (error) -> $scope.$parent.$broadcast "cartridgeError", error
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

    $scope.getFPS = ->
        ~~emulator.getFPS()

    refreshScope = -> $scope.$apply()
    setInterval refreshScope, 1000
