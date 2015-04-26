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
                    return "fa-volume-off";
                } else if (scope.audioVolume < 0.5) {
                    return "fa-volume-down";
                } else {
                    return "fa-volume-up";
                }
            };
            function updateIcon() {
                var volumeIcon = element.find(".volume-icon-value");
                var disableIcon = element.find(".volume-icon-disable");
                volumeIcon.removeClass("fa-volume-up");
                volumeIcon.removeClass("fa-volume-down");
                volumeIcon.removeClass("fa-volume-off");
                volumeIcon.addClass(getIconClass());
                disableIcon.css("display", isAudioEnabled() ? "none" : "inline-block");
            };
            scope.$watch("audioEnabled", updateIcon);
            scope.$watch("audioVolume", updateIcon);
        }
    };
});
