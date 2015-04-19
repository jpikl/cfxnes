angular.module("cfxnes").directive("lazySrc", () => {
    return {
        restriction: "A",
        replace: true,
        link: (scope, element, attrs) => {
            var src = attrs["lazySrc"];
            if (src) {
                var image = $(`<img src="${src}"/>`).insertAfter(element);
                image.hide().load(() => {
                    image.show();
                    element.hide();
                });
            }
        }
    };
});
