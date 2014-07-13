app = angular.module "nescoffee", [ "ui.router", "ui.bootstrap" ]

app.config ($stateProvider, $urlRouterProvider, $tooltipProvider) ->
    $stateProvider
        .state "emulator",
            url: "/"
            views:
                "header":
                    templateUrl: "modules/emulator/toolbar.html"
                    controller:  "ToolbarController"
                "content":
                    templateUrl: "modules/emulator/emulator.html"
                    controller:  "EmulatorController"
        .state "library",
            url: "/library"
            views:
                "content":
                    templateUrl: "modules/library/library.html"
                    controller:  "LibraryController"
        .state "config",
            url: "/config"
            views:
                "content":
                    templateUrl: "modules/config/config.html"
                    controller:  "ConfigController"
        .state "about",
            url: "/about"
            views:
                "content":
                    templateUrl: "modules/about/about.html"

    $urlRouterProvider.otherwise "/"

    $tooltipProvider.options
        placement: "bottom"
        animation: false
        appendToBody: true

app.run (emulator) ->
