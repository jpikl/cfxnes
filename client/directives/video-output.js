angular.module("cfxnes").directive("videoOutput", () => {
    return {
        restrict: "A",
        link: (scope, element, attrs) => {
            var emulator = scope.$eval(attrs["videoOutput"]);
            emulator.setVideoOutput(element[0]);
            if (emulator.isCartridgeInserted()) {
                emulator.step(); // To refresh screen
            }
        }
    };
});
