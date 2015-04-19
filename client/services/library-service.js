angular.module("cfxnes").service("library", function($http, $q) {

    this.getROMs = function() {
        return $http({
            method: "GET",
            url: "/roms/"
        });
    };

    this.getROM = function(id) {
        return $http({
            method: "GET",
            url: `/roms/${id}`
        });
    };

    this.getROMFile = function(id) {
        return this.getROM(id).then((response) => {
            return $http({
                method: "GET",
                url: response.data.fileURL,
                responseType: "arraybuffer"
            });
        });
    };

});
