angular.module("cfxnes").controller("AboutController", ["$scope", ($scope) => {

    $scope.changelogVisible = false;
    $scope.showChangelog = () => {
        $scope.changelogVisible = true;
    }

}]);
