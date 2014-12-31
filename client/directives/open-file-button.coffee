angular.module "cfxnes"

.directive "openFileButton", ->
    restrict: "E"
    templateUrl: "directives/open-file-button.html"
    scope: true
    replace: true
    transclude: true
    link: (scope, element, attrs) ->
        fileInput = element.find "input[type='file']"
        fileInput.hide()
        fileInput.on "change", (event) ->
            element.blur()
            event.preventDefault()
            event.stopPropagation()
            locals = "file": event.originalEvent.target.files[0]
            scope.$eval attrs["onFileLoad"], locals
        element.on "click", (event) ->
            fileInput[0].click() # Do not use jquery click method (causes recursion)
