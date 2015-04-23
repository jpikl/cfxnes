angular.module("cfxnes").controller("ConfigController",
    ["$scope", "$stateParams", "$modal", "emulator", "globalParams",
    ($scope, $stateParams, $modal, emulator, globalParams) => {

    var arrayToProperties = function(array, callback, thisArg) {
        var object = {};
        for (var value of array) {
            object[value] = callback.call(thisArg, value);
        }
        return object;
    }

    $scope.emulation = globalParams.emulationConfig;
    $scope.emulation.visible = $stateParams.section == "" || $stateParams.section === "emulation";
    $scope.emulation.tvSystem = emulator.getTVSystem() || "auto";
    $scope.emulation.speed = emulator.getSpeed();

    $scope.video = globalParams.videoConfig;
    $scope.video.visible = $stateParams.section === "video";
    $scope.video.scale = emulator.getVideoScale();
    $scope.video.maxScale = emulator.getMaxVideoScale();
    $scope.video.palette = emulator.getVideoPalette();
    $scope.video.webGL = emulator.getVideoRenderer() === "webgl";
    $scope.video.webGLSupported = emulator.isVideoRendererSupported("webgl");
    $scope.video.debugging = emulator.isVideoDebugging();
    $scope.video.smoothing = emulator.isVideoSmoothing();

    $scope.audio = globalParams.audioConfig;
    $scope.audio.visible = $stateParams.section === "audio";
    $scope.audio.supported = emulator.isAudioSupported();
    $scope.audio.enabled = emulator.isAudioEnabled();
    $scope.audio.volume = emulator.getAudioVolume();
    $scope.audio.channels = arrayToProperties(emulator.audioChannels, (channel) => emulator.isAudioChannelEnabled(channel));

    $scope.controls = globalParams.controlsConfig;
    $scope.controls.visible = $stateParams.section === "controls";
    $scope.controls.infoDisabled = localStorage["controlsInfoDisabled"] === "true";
    $scope.controls.devices = arrayToProperties(emulator.inputPorts, (port) => emulator.getInputDevice(port) || "none");

    $scope.$watch("emulation.tvSystem", (tvSystem) => emulator.setTVSystem(tvSystem));
    $scope.$watch("emulation.speed", (speed) => emulator.setSpeed(speed));

    $scope.$watch("video.scale", (scale) => emulator.setVideoScale(scale));
    $scope.$watch("video.palette", (palette) => emulator.setVideoPalette(palette));
    $scope.$watch("video.webGL", (webGL) => emulator.setVideoRenderer(webGL ? "webgl" : "canvas"));
    $scope.$watch("video.debugging", (debugging) => emulator.setVideoDebugging(debugging));
    $scope.$watch("video.smoothing", (smoothing) => emulator.setVideoSmoothing(smoothing));

    $scope.$watch("audio.enabled", (enabled) => emulator.setAudioEnabled(enabled));
    $scope.$watch("audio.volume", (volume) => emulator.setAudioVolume(volume));
    for (let channel of emulator.audioChannels) {
        $scope.$watch(`audio.channels.${channel}`, (enabled) => emulator.setAudioChannelEnabled(channel, enabled));
    }

    $scope.$watch("controls.infoDisabled", (disabled) => localStorage["controlsInfoDisabled"] = disabled ? "true" : "false");
    for (let port of emulator.inputPorts) {
        $scope.$watch(`controls.devices[${port}]`, (device) => emulator.setInputDevice(port, device === "none" ? null : device));
    }

    $scope.percentageFormater = (value) => `${~~(100 * value)}%`;
    $scope.multiplierFormater = (value) => `${value}x`;
    $scope.getMappedInputName = (targetPort, targetId, targetInput) => emulator.getMappedInputName(targetPort, targetId, targetInput) || "--";

    $scope.recordInput = (targetPort, targetId, targetInput) => {
        var modal = $modal.open({
            template: "Press key or mouse button...",
            windowClass: "modal-record-input",
            keyboard: false
        });
        emulator.recordInput((sourceId, sourceInput) => {
            modal.close();
            if (sourceId !== "keyboard" || sourceInput !== "escape") {
                emulator.mapInput(targetPort, targetId, targetInput, sourceId, sourceInput);
                $scope.$apply();
            }
        });
    };

    $scope.restoreDefaults = () => {
        emulator.setInputDefaults();
        $scope.controls.devices = arrayToProperties(emulator.inputPorts, (port) => emulator.getInputDevice(port) || "none");
    };

    $scope.$on("$stateChangeStart", () => {
        if (localStorage["controlsInfoDisabled"] === "true") {
            globalParams.controlsInfoVisible = false;
        }
    });

}]);
