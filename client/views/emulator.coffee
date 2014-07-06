app = angular.module "nescoffee"

app.controller "EmulatorController", ($scope, $rootScope, emulator) ->
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
