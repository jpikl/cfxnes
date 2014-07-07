app = angular.module "nescoffee"

app.service "library", ($http) ->
    @listROMs = ->
        $http
            method: "GET"
            url: "/roms/"

    @getROM = (id) ->
        $http
            method: "GET"
            url: "/roms/#{id}"

    this

app.controller "LibraryController", ($scope, library) ->
    $scope.romsFilter = {}
    $scope.selectedROM = null

    library.listROMs()
        .success (data) ->
            $scope.roms = data

    $scope.selectROM = (rom) ->
        $scope.selectedROM = rom

    $scope.isSelectedROM = (rom) ->
        rom is $scope.selectedROM
