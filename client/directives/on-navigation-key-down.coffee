angular.module "nescoffee"

.directive "onNavigationKeyDown", ->
    restriction: "A"
    scope: false
    link: (scope, element, attrs) ->
        keyDown = (key) ->
            event.preventDefault()
            locals = "key": key
            scope.$eval attrs["onNavigationKeyDown"], locals
        element.on "keydown", (event) ->
            switch event.keyCode
                when 13 then keyDown "enter"
                when 33 then keyDown "page-up"
                when 34 then keyDown "page-down"
                when 35 then keyDown "end"
                when 36 then keyDown "home"
                when 38 then keyDown "up"
                when 40 then keyDown "down"
