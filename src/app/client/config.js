angular.module("cfxnes").config(($stateProvider, $urlRouterProvider, $tooltipProvider) => {

    $stateProvider.state("emulator", {
        url: "/emulator/{gameId}",
        views: {
            "header": {
                templateUrl: "views/toolbar.html",
                controller: "ToolbarController"
            },
            "content": {
                templateUrl: "views/emulator.html",
                controller: "EmulatorController"
            }
        }
    }).state("library", {
        url: "/library/",
        views: {
            "content": {
                templateUrl: "views/library.html",
                controller: "LibraryController"
            }
        }
    }).state("config", {
        url: "/config/{section}",
        views: {
            "content": {
                templateUrl: "views/config.html",
                controller: "ConfigController"
            }
        }
    }).state("about", {
        url: "/about/",
        views: {
            "content": {
                templateUrl: "views/about.html"
            }
        }
    });

    $urlRouterProvider.otherwise("/emulator/");

    $tooltipProvider.options({
        placement: "bottom",
        animation: false,
        appendToBody: true
    });

});
