//=========================================================
// Conversion utilities
//=========================================================

var convert = {

    md5: require("../../../node_modules/js-md5/src//md5"),

    dataToString: function(input) {
        return String.fromCharCode.apply(null, input);
    },

    stringToData: function(input, output) {
        if (output == null) {
            output = new Uint8Array(input.length);
        }
        for (var i = 0; i < input.length; i++) {
            output[i] = input.charCodeAt(i);
        }
        return output;
    },

    objectToString: function(input) {
        return JSON.stringify(input);
    },

    stringToObject: function(input) {
        return JSON.parse(input);
    }

};

module.exports = convert;
