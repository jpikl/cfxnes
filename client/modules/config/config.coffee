app = angular.module "nescoffee"

app.controller "ConfigController", ($scope, emulator) ->
    $scope.config =
        tvSystem: "auto"
        colorPalette: "default"
        videoScale: 1
        videoDebug: false
        controller:
            1: "joypad"
            2: "zapper"
        controls:
            1:
                "joypad":
                    "a": "Test"

    $scope.controlsOpen = true

    $scope.getMaxScale = ->
        emulator.getMaxVideoScale()
