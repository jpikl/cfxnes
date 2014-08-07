angular.module "nescoffee"

.controller "ToolbarController", ($scope, emulator) ->
    $scope.loadCartridge = (file) ->
        emulator.loadCartridge file

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
        emulator.decreaseVideoScale()

    $scope.increaseSize = ->
        emulator.increaseVideoScale()

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
