angular.module "cfxnes"

.controller "LibraryController", ($scope, $state, library, emulator, globalParams) ->
    $scope.gameFilter = globalParams.gameFilter ?= { name: "" }
    $scope.loading = true

    $scope.playGame = (game) ->
        $state.go "emulator", { gameId: game.id }

    library.listROMs()
        .success (data) ->
            $scope.games = data
            for game in $scope.games
                game.image = library.getROMImageURL game
            $scope.loading = false
        .error (data, status) ->
            $scope.error = "Unable to download game list (server response: #{status})"
            $scope.loading = false
