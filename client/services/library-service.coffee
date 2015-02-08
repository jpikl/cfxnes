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
        deferred = $q.defer()
        @getROM id
            .then (response) ->
                $http
                    method: "GET"
                    url: response.data.fileURL
                    responseType: "arraybuffer"
                .then (response) ->
                    deferred.resolve response
                .catch (response) ->
                    deferred.reject response
            .catch (response) ->
                deferred.reject response
        deferred.promise

    this
