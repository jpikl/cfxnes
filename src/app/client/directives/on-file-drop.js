angular.module("cfxnes").directive("onFileDrop", () => {
    return {
        restrict: "A",
        link: (scope, element, attrs) => {
            element.on("dragenter", event => {
                element.addClass("drag-over");
            });
            element.on("dragleave", event => {
                element.removeClass("drag-over");
            });
            element.on("dragover", event => {
                element.addClass("drag-over");
                event.preventDefault();
                event.stopPropagation();
                event.originalEvent.dataTransfer.dropEffect = "copy";
            });
            element.on("drop", event => {
                element.removeClass("drag-over");
                event.preventDefault();
                event.stopPropagation();
                var file = event.originalEvent.dataTransfer.files[0];
                if (file) {
                    scope.$eval(attrs["onFileDrop"], {"file": file});
                }
            });
        }
    };
});
