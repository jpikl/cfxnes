app = angular.module "nescoffee", [ "ngRoute" ]

app.config ($routeProvider) ->
    $routeProvider.when "/",
        templateUrl: "emulator/emulator.html"
        controller: "EmulatorController"
    .otherwise
        redirectTo: "/"
