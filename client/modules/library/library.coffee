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
    $scope.loadingDone = false

    library.listROMs()
        .success (data) ->
            $scope.roms = data
            $scope.loadingDone = true
        .error (data) ->
            $scope.error = data or "Unknown error."
            $scope.loadingDone = true

    $scope.selectROM = (rom) ->
        $scope.selectedROM = rom

    $scope.playSelectedROM = ->
