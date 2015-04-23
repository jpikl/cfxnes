angular.module("cfxnes").directive("focusWhen", ["$timeout", ($timeout) => {
    return {
        restriction: "A",
        scope: {
            target: "&focusWhen"
        },
        link: (scope, element, attrs) => {
            scope.$watch("target()", (value) => {
                $timeout(() => {
                    if (value) {
                        element.focus();
                        element.select();
                    } else {
                        element.blur();
                    }
                });
            });
        }
    };
}]);
