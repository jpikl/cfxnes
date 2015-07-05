angular.module("cfxnes").controller("EmulatorController",
    ["$scope", "$state", "$stateParams", "emulator", "library", "globalParams",
    ($scope, $state, $stateParams, emulator, library, globalParams) => {

    $scope.emulator = emulator;

    $scope.loadCartridge = file => {
        var onLoad = () => $scope.$broadcast("cartridgeLoadSuccess");
        var onError = error => $scope.$broadcast("cartridgeLoadError", error);
        emulator.loadCartridge(file, onLoad, onError);
    };

    $scope.clearError = () => {
        $scope.error = null;
    }

    $scope.hideControlsInfo = () => {
        globalParams.controlsInfoVisible = false;
        $scope.controlsInfoVisible = false;
    }

    $scope.changeControlsUrl = $state.href("settings", { section: "controls" });
    $scope.controlsInfoVisible = globalParams.controlsInfoVisible;

    $scope.getMappedInputName = (device, input) => {
        if (emulator.getInputDevice(1) === device) {
            return emulator.getMappedInputName(1, device, input) || "--";
        } else if (emulator.getInputDevice(2) === device) {
            return emulator.getMappedInputName(2, device, input) || "--";
        } else {
            return "--";
        }
    };

    $scope.$on("cartridgeLoadStart", () => {
        emulator.removeCartridge();
        emulator.stop();
        $scope.loading = true;
        $scope.error = null;
    });

    $scope.$on("cartridgeLoadSuccess", gameId => {
        globalParams.gameId = gameId;
        $scope.loading = false;
        $scope.error = null;
        emulator.start();
    });

    $scope.$on("cartridgeLoadError", (event, error) => {
        $scope.loading = false;
        $scope.error = error;
    });

    $scope.$on("$stateChangeStart", () => {
        globalParams.autoPaused = emulator.isRunning();
        emulator.stop();
        emulator.setVideoOutput();
    });

    if ($stateParams.gameId && $stateParams.gameId !== globalParams.gameId) {
        $scope.$broadcast("cartridgeLoadStart");
        library.getROMFile($stateParams.gameId).then(response => {
            try {
                emulator.insertCartridge(response.data);
                $scope.$broadcast("cartridgeLoadSuccess", $stateParams.gameId);
            } catch (error) {
                console.error(error.stack || error);
                $scope.$broadcast("cartridgeLoadError", error.message || "Unknown error");
            }
        }).catch(response => {
            $scope.$broadcast("cartridgeLoadError", `Unable to download file (server response: ${response.status})`);
        });
    } else if (globalParams.autoPaused) {
        return emulator.start();
    }

}]);
