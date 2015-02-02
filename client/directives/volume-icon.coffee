angular.module "cfxnes"

.directive "volumeIcon", ->
    restriction: "E"
    templateUrl: "directives/volume-icon.html"
    replace: true
    link: (scope, element, attrs) ->
        getIconClass = (volume) ->
            if not scope.audioSupported or not scope.audioEnabled or scope.audioVolume is 0
                "glyphicon-volume-off"
            else if scope.audioVolume < 50
                "glyphicon-volume-down"
            else
                "glyphicon-volume-up"
        updateIcon = (volume) ->
            element.removeClass "glyphicon-volume-up"
            element.removeClass "glyphicon-volume-down"
            element.removeClass "glyphicon-volume-off"
            element.addClass getIconClass(volume)
        scope.$watch "audioEnabled", updateIcon
        scope.$watch "audioVolume", updateIcon
