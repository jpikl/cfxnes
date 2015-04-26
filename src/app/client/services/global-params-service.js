angular.module("cfxnes").factory("globalParams", () => {
    return {
        controlsInfoVisible: localStorage["controlsInfoDisabled"] !== "true",
        gameFilter: { name: "" },
        emulationSettings: {},
        videoSettings: {},
        audioSettings: {},
        controlsSettings: {}
    };
});
