angular.module("cfxnes").directive("volumeIcon", () => {
    return {
        restriction: "E",
        templateUrl: "directives/volume-icon.html",
        replace: true,
        link: (scope, element, attrs) => {
            function isAudioEnabled() {
                return scope.audioSupported && scope.audioEnabled
            }
            function getIconClass() {
                if (!scope.audioSupported || scope.audioVolume === 0) {
                    return "icon-volume-off";
                } else if (scope.audioVolume < 0.5) {
                    return "icon-volume-down";
                } else {
                    return "icon-volume-up";
                }
            };
            function updateIcon() {
                var volumeIcon = element.find(".volume-icon-value");
                var disableIcon = element.find(".volume-icon-disable");
                volumeIcon.removeClass("icon-volume-up");
                volumeIcon.removeClass("icon-volume-down");
                volumeIcon.removeClass("icon-volume-off");
                volumeIcon.addClass(getIconClass());
                disableIcon.css("display", isAudioEnabled() ? "none" : "inline-block");
            };
            scope.$watch("audioEnabled", updateIcon);
            scope.$watch("audioVolume", updateIcon);
        }
    };
});
