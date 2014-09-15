angular.module "nescoffee"

.directive "focusWhen", ->
    restriction: "A"
    scope:
        target: "&focusWhen"
    link: (scope, element, attrs) ->
        scope.$watch "target()", (value) ->
            if value
                element.focus()
                element.select?()
            else
                element.blur()
