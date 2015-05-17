angular.module("cfxnes", [
    "ui.router",
    "ui.bootstrap",
    "ui.bootstrap-slider"
]);

angular.module("cfxnes").config(
    ["$stateProvider", "$urlRouterProvider", "$tooltipProvider",
    ($stateProvider, $urlRouterProvider, $tooltipProvider) => {

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
    }).state("settings", {
        url: "/settings/{section}",
        views: {
            "content": {
                templateUrl: "views/settings.html",
                controller: "SettingsController"
            }
        }
    }).state("about", {
        url: "/about/",
        views: {
            "content": {
                templateUrl: "views/about.html",
                controller: "AboutController"
            }
        }
    });

    $urlRouterProvider.otherwise("/emulator/");

    $tooltipProvider.options({
        placement: "bottom",
        animation: false,
        appendToBody: true
    });

    // Fix initial position of slider tooltip (temporary workaround)
    var sliderPrototype = $.fn.slider.Constructor.prototype;
    var sliderShowTooltip = sliderPrototype.showTooltip;
    sliderPrototype.showTooltip = function() {
        if (!this.tooltipPositionRefreshed) {
            this.size = this.picker[0][this.sizePos];
            this.layout();
            this.tooltipPositionRefreshed = true;
        }
        sliderShowTooltip.call(this);
    }
}]);
