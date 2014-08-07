angular.module "nescoffee"

.directive "onCreate", ->
    restrict: "A"
    scope: true
    link: (scope, element, attrs) ->
        locals = "element": element
        scope.$eval attrs["onCreate"], locals
