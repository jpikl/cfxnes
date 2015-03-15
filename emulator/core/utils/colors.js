//=========================================================
// Color manipulation utilities
//=========================================================

var system = require("./system");

var colors = {

    pack: function(r, g, b, a) {
        if (a == null) {
            a = 0xFF;
        }
        if (system.littleEndian) {
            return a << 24 | b << 16 | g << 8 | r;
        } else {
            return r << 24 | g << 16 | b << 8 | a;
        }
    },

    unpack: function(color) {
        if (system.littleEndian) {
            return [
                (color       ) & 0xFF,
                (color >>>  8) & 0xFF,
                (color >>> 16) & 0xFF,
                (color >>> 24) & 0xFF
            ];
        } else {
            return [
                (color >>> 24) & 0xFF,
                (color >>> 16) & 0xFF,
                (color >>>  8) & 0xFF,
                (color       ) & 0xFF
            ];
        }
    }

};

colors.BLACK = colors.pack(0, 0, 0);

module.exports = colors;
