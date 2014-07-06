app = angular.module "nescoffee"

app.controller "EmulatorController", ($scope, emulator) ->
    $scope.startEmulator = ->
        emulator.start()

    $scope.increaseVideoScale = ->
        emulator.increaseVideoScale()

    $scope.decreaseVideoScale = ->
        emulator.decreaseVideoScale()

    $scope.enterFullScreen = ->
        emulator.enterFullScreen()
