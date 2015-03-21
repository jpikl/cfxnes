var defaultPalette   = require("../palettes/default-palette");
var brightPalette    = require("../palettes/bright-palette");
var realisticPalette = require("../palettes/realistic-palette");
var logger           = require("../utils/logger").get();

//=========================================================
// Factory for palette creation
//=========================================================

class PaletteFactory {

    constructor() {
        this.palettes = {
            "default":   defaultPalette,
            "bright":    brightPalette,
            "realistic": realisticPalette
        };
    }

    createPalette(id) {
        var palette = this.palettes[id];
        if (!palette) {
            throw new Error(`Unsupported palette '${id}'`);
        }
        return palette;
    }

}

module.exports = PaletteFactory;
