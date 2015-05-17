angular.module("cfxnes").controller("ToolbarController",
    ["$scope", "emulator", ($scope, emulator) => {

    $scope.loadCartridge = (file) => {
        var onLoad = () => $scope.$parent.$broadcast("cartridgeLoadSuccess");
        var onError = (error) => $scope.$parent.$broadcast("cartridgeLoadError", error);
        emulator.loadCartridge(file, onLoad, onError);
    };

    $scope.isRunning = () => emulator.isRunning()
    $scope.start = () => emulator.start();
    $scope.stop = () => emulator.stop();

    $scope.hardReset = () => emulator.hardReset();
    $scope.softReset = () => emulator.softReset();

    $scope.isMinSize = () => emulator.getVideoScale() === 1;
    $scope.isMaxSize = () => emulator.getVideoScale() === emulator.getMaxVideoScale();
    $scope.decreaseSize = () => emulator.setVideoScale(emulator.getVideoScale() - 1);
    $scope.increaseSize = () => emulator.setVideoScale(emulator.getVideoScale() + 1);
    $scope.enterFullScreen = () => emulator.enterFullScreen();

    $scope.audioSupported = emulator.isAudioSupported();
    $scope.audioEnabled = emulator.isAudioEnabled();
    $scope.audioVolume = emulator.getAudioVolume();

    $scope.$watch("audioEnabled", (value) => emulator.setAudioEnabled(value));
    $scope.$watch("audioVolume", (value) => emulator.setAudioVolume(value));

    $scope.percentageFormater = (value) => `${~~(100 * value)}%`;
    $scope.preventClose = (event) => event.stopPropagation();
    $scope.fpsVisible = localStorage["fpsVisible"] !== "false";
    $scope.getFPS = () => ~~emulator.getFPS();

    setInterval(() => $scope.$apply(), 1000); // To periodically refresh FPS counter

}]);
