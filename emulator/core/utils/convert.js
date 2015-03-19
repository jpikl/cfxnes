var system = require("./system");

//=========================================================
// Conversion utilities
//=========================================================

var convert = {

    md5: window.md5 || system.require("js-md5"),

    dataToString(input) {
        return String.fromCharCode.apply(null, input);
    },

    stringToData(input, output) {
        if (output == null) {
            output = new Uint8Array(input.length);
        }
        for (var i = 0; i < input.length; i++) {
            output[i] = input.charCodeAt(i);
        }
        return output;
    },

    objectToString(input) {
        return JSON.stringify(input);
    },

    stringToObject(input) {
        return JSON.parse(input);
    }

};

module.exports = convert;
