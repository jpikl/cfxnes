angular.module "nescoffee"

.controller "LibraryController", ($scope, $state, $timeout, library, emulator, globalParams) ->
    $scope.romsFilter = globalParams.romsFilter ?= { name: "" }

    moveROMSelection = (increment) ->
        index = $scope.filteredROMs.indexOf $scope.selectedROM
        index = Math.max(0, Math.min($scope.filteredROMs.length - 1, index + increment))
        $scope.selectedROM = $scope.filteredROMs[index]
        $timeout ->
            # Scroll to the selected row when it's out of visible area
            table = $("#library")
            selectedRow = $("#library tr.info")
            if increment < 0
                tableTop = table.offset().top
                selectedRowTop = selectedRow.offset().top
                if selectedRowTop < tableTop
                    selectedRow[0].scrollIntoView true
            else if increment > 0
                tableBottom = table.offset().top + table.height()
                selectedRowBottom = selectedRow.offset().top + selectedRow.height()
                if selectedRowBottom > tableBottom
                    selectedRow[0].scrollIntoView false

    $scope.navigationKeyDown = (key) ->
        if $scope.loadingDone
            switch key
                when "enter"     then $scope.platROM $scope.selectedROM
                when "up"        then moveROMSelection -1
                when "down"      then moveROMSelection +1
                when "page-up"   then moveROMSelection -10
                when "page-down" then moveROMSelection +10
                when "home"      then moveROMSelection -$scope.roms.length
                when "end"       then moveROMSelection +$scope.roms.length

    $scope.selectROM = (rom) ->
        $scope.selectedROM = rom

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
