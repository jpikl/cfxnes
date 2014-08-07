angular.module "nescoffee"

.directive "onCreate", ->
    restrict: "A"
    link: (scope, element, attrs) ->
        locals = "element": element
        scope.$eval attrs["onCreate"], locals
