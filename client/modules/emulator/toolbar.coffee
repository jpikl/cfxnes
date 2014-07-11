app = angular.module "nescoffee"

app.controller "ToolbarController", ($scope, emulator) ->
    $scope.isRunning = ->
        emulator.isRunning()

    $scope.startEmulator = ->
        emulator.start()

    $scope.stopEmulator = ->
        emulator.stop()

    $scope.pressPower = ->
        emulator.pressPower()

    $scope.pressReset = ->
        emulator.pressReset()

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
