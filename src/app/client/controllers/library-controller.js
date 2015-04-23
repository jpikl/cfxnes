angular.module("cfxnes").controller("LibraryController",
    ["$scope", "$state", "library", "emulator", "globalParams",
    ($scope, $state, library, emulator, globalParams) => {

    $scope.gameFilter = globalParams.gameFilter;
    $scope.loading = true;

    $scope.playGame = (game) => {
        $state.go("emulator", { gameId: game.id });
    };

    library.getROMs().success((data) => {
        $scope.games = data;
        $scope.loading = false;
    }).error((data, status) => {
        $scope.error = `Unable to download game list (server response: ${status})`;
        $scope.loading = false;
    });

}]);
