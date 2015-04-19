angular.module("cfxnes").factory("globalParams", () => {
    return {
        controlsInfoVisible: localStorage["controlsInfoDisabled"] !== "true",
        gameFilter: { name: "" },
        emulationConfig: {},
        videoConfig: {},
        audioConfig: {},
        controlsConfig: {}
    };
});
