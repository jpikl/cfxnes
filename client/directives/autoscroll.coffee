angular.module "nescoffee"

.directive "autoscroll", ($timeout) ->
    restriction: "A"
    scope:
        selector: "@autoscroll"
        trigger: "&autoscrollTrigger"
    link: (scope, element, attrs) ->
        scope.$watch "trigger()", ->
            $timeout ->
                target = element.find scope.selector
                if target.length
                    elementTop = element.offset().top
                    elementBottom = elementTop + element.height()
                    targetTop = target.offset().top
                    targetBottom = targetTop + target.height()
                    if targetTop < elementTop
                        target[0].scrollIntoView true
                    else if targetBottom > elementBottom
                        target[0].scrollIntoView false
