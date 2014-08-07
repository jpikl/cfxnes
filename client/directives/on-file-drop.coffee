angular.module "nescoffee"

.directive "onFileDrop", ->
    restrict: "A"
    scope: true
    link: (scope, element, attrs) ->
        element.on "dragover", (event) ->
            event.preventDefault()
            event.stopPropagation()
            event.originalEvent.dataTransfer.dropEffect = "copy"
        element.on "drop", (event) ->
            event.preventDefault()
            event.stopPropagation()
            locals = "file": event.originalEvent.dataTransfer.files[0]
            scope.$eval attrs["onFileDrop"], locals
