angular.module "nescoffee"

.controller "LibraryController", ($scope, $state, $timeout, library, emulator, globalParams) ->
    $scope.romsFilter = globalParams.romsFilter ?= { name: "" }

    $scope.selectROM = (rom) ->
        $scope.selectedROM = rom

    moveROMSelection = (increment) ->
        index = $scope.filteredROMs.indexOf $scope.selectedROM
        index = Math.max(0, Math.min($scope.filteredROMs.length - 1, index + increment))
        $scope.selectedROM = $scope.filteredROMs[index]
        $scope.$apply()

    $scope.navigationKeyDown = (key) ->
        if $scope.loadingDone
            switch key
                when "enter"     then $scope.playROM $scope.selectedROM
                when "up"        then moveROMSelection -1
                when "down"      then moveROMSelection +1
                when "page-up"   then moveROMSelection -10
                when "page-down" then moveROMSelection +10
                when "home"      then moveROMSelection -$scope.roms.length
                when "end"       then moveROMSelection +$scope.roms.length

    $scope.playROM = (rom) ->
        if rom
            library.getROM rom.id
                .success (data) ->
                    $scope.playError = emulator.insertCartridge data
                    unless $scope.playError
                        emulator.start()
                        $state.go "emulator"
                .error (data, status) ->
                    $scope.playError = "Unable to download file (server response: #{status})."

    $scope.clearError = ->
        $scope.playError = null

    library.listROMs()
        .success (data) ->
            $scope.roms = data
            $scope.loadingDone = true
        .error (data, status) ->
            $scope.loadingError = "Unable to download game list (server response: #{status})."
            $scope.loadingDone = true
