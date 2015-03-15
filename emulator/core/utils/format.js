//=========================================================
// Formating utilities
//=========================================================

var format = {

    numberAsHex: function(value) {
        return value.toString(16).toUpperCase();
    },

    byteAsHex: function(value) {
        var hex = format.numberAsHex(value);
        return (hex.length === 1) ? "0" + hex : hex;
    },

    wordAsHex: function(value) {
        var hex1 = format.byteAsHex(value & 0xFF);
        var hex2 = format.byteAsHex(value >>> 8);
        return hex2 + hex1;
    },

    fillLeft: function(value, width, character) {
        if (character == null) {
            character = " ";
        }
        var result = Array(width + 1).join(character) + value;
        return result.slice(result.length - width);
    },

    fillRight: function(value, width, character) {
        if (character == null) {
            character = " ";
        }
        var result = value + Array(width + 1).join(character);
        return result.slice(0, width);
    },

    capitalize: function(value) {
        var words = value.split(" ");
        for (var i = 0; i < words.length; i++) {
            words[i] = words[i].slice(0, 1).toUpperCase() + words[i].slice(1).toLowerCase();
        }
        return words.join(" ");
    },

    readableSize: function(size) {
        if (typeof size !== "number") {
            return "???";
        }
        if (size >= 1024 * 1024) {
            return (size / (1024 * 1024)) + " MB";
        }
        if (size >= 1024) {
            return (size / 1024) + " KB";
        }
        return size + " B";
    },

    readableBytes: function(bytes) {
        if (!bytes) {
            return "???";
        }
        return String.fromCharCode.apply(null, bytes);
    }

};

module.exports = format;
