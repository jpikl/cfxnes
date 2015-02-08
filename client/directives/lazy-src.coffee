angular.module "cfxnes"

.directive "lazySrc", ->
    restriction: "A"
    replace: true
    link: (scope, element, attrs) ->
        src = attrs["lazySrc"]
        if src
            image = $("<img src=\"#{src}\"/>").insertAfter element
            image.hide().load ->
                image.show()
                element.hide()
