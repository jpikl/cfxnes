angular.module "cfxnes"

.controller "LibraryController", ($scope, $state, $timeout, library, emulator, globalParams) ->
    $scope.gamesFilter = globalParams.gamesFilter ?= { name: "" }

    $scope.playGame = (game) ->
        library.getROM game.id
            .success (data) ->
                $scope.cartridgeError = emulator.insertCartridge data
                unless $scope.cartridgeError
                    emulator.start()
                    $state.go "emulator"
            .error (data, status) ->
                $scope.cartridgeError = "Unable to download file (server response: #{status})."

    $scope.clearError = ->
        $scope.cartridgeError = null

    library.listROMs()
        .success (data) ->
            $scope.games = data
            $scope.libraryLoaded = true
        .error (data, status) ->
            $scope.libraryError = "Unable to download game list (server response: #{status})."
            $scope.libraryLoaded = true
