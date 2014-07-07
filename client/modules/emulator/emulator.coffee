app = angular.module "nescoffee"

app.factory "emulator", -> new NESCoffee

app.controller "EmulatorController", ($scope, $rootScope, emulator) ->

    emulator.onLoad = -> @start() unless @isRunning()
    emulator.onError = (error) -> alert error

    $scope.isEmulatorRunning = ->
        emulator.isRunning()

    $scope.startEmulator = ->
        emulator.start()

    $scope.stopEmulator = ->
        emulator.stop()

    $scope.pressPower = ->
        emulator.pressPower()

    $scope.pressReset = ->
        emulator.pressReset()

    $scope.increaseVideoScale = ->
        emulator.increaseVideoScale()

    $scope.decreaseVideoScale = ->
        emulator.decreaseVideoScale()

    $scope.enterFullScreen = ->
        emulator.enterFullScreen()

    $scope.getFPS = ->
        ~~emulator.getFPS()

    refreshScope = -> $scope.$apply()
    setInterval refreshScope, 1000
