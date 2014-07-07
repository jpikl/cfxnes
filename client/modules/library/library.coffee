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
            responseType: "arraybuffer"

    this

app.controller "LibraryController", ($scope, $state, library, emulator) ->
    library.listROMs()
        .success (data) ->
            $scope.roms = data
            $scope.loadingDone = true
        .error (data, status) ->
            $scope.loadingError = "Unable to download game list (server response: #{status})."
            $scope.loadingDone = true

    $scope.selectROM = (rom) ->
        $scope.selectedROM = rom

    $scope.playSelectedROM = ->
        $scope.playROM $scope.selectedROM

    $scope.playROM = (rom) ->
        library.getROM rom.id
            .success (data) ->
                $scope.playError = emulator.tryInsertCartridge data
                unless $scope.playError
                    emulator.start()
                    $state.go "emulator"
            .error (data, status) ->
                $scope.playError = "Unable to download file (server response: #{status})."

    $scope.clearError = ->
        $scope.playError = null
