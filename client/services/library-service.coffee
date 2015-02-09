angular.module "cfxnes"

.service "library", ($http, $q) ->
    @listROMs = ->
        $http
            method: "GET"
            url: "/roms/"

    @getROM = (id) ->
        $http
            method: "GET"
            url: "/roms/#{id}"

    @getROMFile = (id) ->
        @getROM id
            .then (response) ->
                $http
                    method: "GET"
                    url: response.data.fileURL
                    responseType: "arraybuffer"

    this
