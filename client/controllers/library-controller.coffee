angular.module "nescoffee"

.controller "LibraryController", ($scope, $state, $timeout, library, emulator, globalParams) ->
    $scope.gamesFilter = globalParams.gamesFilter ?= { name: "" }

    $scope.selectGame = (game) ->
        $scope.selectedGame = game

    moveGameSelection = (increment) ->
        index = $scope.filteredGames.indexOf $scope.selectedGame
        index = Math.max(0, Math.min($scope.filteredGames.length - 1, index + increment))
        $scope.selectedGame = $scope.filteredGames[index]
        $scope.$apply()

    $scope.navigationKeyDown = (key) ->
        if $scope.libraryLoaded
            switch key
                when "enter"     then $scope.playGame $scope.selectedGame
                when "up"        then moveGameSelection -1
                when "down"      then moveGameSelection +1
                when "page-up"   then moveGameSelection -10
                when "page-down" then moveGameSelection +10
                when "home"      then moveGameSelection -$scope.games.length
                when "end"       then moveGameSelection +$scope.games.length

    $scope.playGame = (game) ->
        if game
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
