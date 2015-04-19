angular.module("cfxnes").directive("volumeIcon", () => {
    return {
        restriction: "E",
        templateUrl: "directives/volume-icon.html",
        replace: true,
        link: (scope, element, attrs) => {
            var getIconClass = (volume) => {
                if (!scope.audioSupported || !scope.audioEnabled || scope.audioVolume === 0) {
                    return "glyphicon-volume-off";
                } else if (scope.audioVolume < 0.5) {
                    return "glyphicon-volume-down";
                } else {
                    return "glyphicon-volume-up";
                }
            };
            var updateIcon = (volume) => {
                element.removeClass("glyphicon-volume-up");
                element.removeClass("glyphicon-volume-down");
                element.removeClass("glyphicon-volume-off");
                element.addClass(getIconClass(volume));
            };
            scope.$watch("audioEnabled", updateIcon);
            scope.$watch("audioVolume", updateIcon);
        }
    };
});
