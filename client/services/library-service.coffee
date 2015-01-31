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

    @getROMImageURL = (game) ->
        if game.image
            "/roms/#{game.id}/image"
        else
            null

    this
