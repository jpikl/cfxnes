angular.module "cfxnes"

.directive "onNavigationKeyDown", ->
    restriction: "A"
    link: (scope, element, attrs) ->
        element.on "keydown", (event) ->
            keyDown = (key) ->
                event.preventDefault()
                locals = "key": key
                scope.$eval attrs["onNavigationKeyDown"], locals
            switch event.keyCode
                when 13 then keyDown "enter"
                when 33 then keyDown "page-up"
                when 34 then keyDown "page-down"
                when 35 then keyDown "end"
                when 36 then keyDown "home"
                when 38 then keyDown "up"
                when 40 then keyDown "down"
