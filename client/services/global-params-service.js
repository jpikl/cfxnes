angular.module("cfxnes").factory("globalParams", () => {
    return {
        controlsInfoVisible: localStorage["controlsInfoDisabled"] !== "true"
    };
});
