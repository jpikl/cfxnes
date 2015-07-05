angular.module("cfxnes").directive("openFileButton", () => {
    return {
        restrict: "E",
        templateUrl: "directives/open-file-button.html",
        replace: true,
        transclude: true,
        link: (scope, element, attrs) => {
            var fileInput = element.find("input[type='file']");
            fileInput.hide();
            fileInput.on("change", event => {
                element.blur();
                event.preventDefault();
                event.stopPropagation();
                scope.$eval(attrs["onFileLoad"], {
                    "file": event.originalEvent.target.files[0]
                });
            });
            element.on("click", event => {
                fileInput[0].click(); // Do not use jquery click method (causes recursion)
            });
        }
    };
});
