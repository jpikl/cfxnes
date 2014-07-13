app = angular.module "nescoffee"

app.controller "ToolbarController", ($scope, emulator) ->
    $scope.isRunning = ->
        emulator.isRunning()

    $scope.startEmulator = ->
        emulator.start()

    $scope.stopEmulator = ->
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
