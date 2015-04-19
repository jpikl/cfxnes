angular.module("cfxnes").directive("onFileDrop", () => {
    return {
        restrict: "A",
        link: (scope, element, attrs) => {
            element.on("dragover", (event) => {
                event.preventDefault();
                event.stopPropagation();
                event.originalEvent.dataTransfer.dropEffect = "copy";
            });
            element.on("drop", (event) => {
                event.preventDefault();
                event.stopPropagation();
                scope.$eval(attrs["onFileDrop"], {
                    "file": event.originalEvent.dataTransfer.files[0]
                });
            });
        }
    };
});
