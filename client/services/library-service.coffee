angular.module "cfxnes"

.service "library", ($http) ->
    @listROMs = ->
        $http
            method: "GET"
            url: "/roms/"

    @getROM = (id) ->
        $http
            method: "GET"
            url: "/roms/#{id}"
            responseType: "arraybuffer"

    this
