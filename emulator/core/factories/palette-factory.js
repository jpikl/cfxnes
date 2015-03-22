import defaultPalette   from "../palettes/default-palette";
import brightPalette    from "../palettes/bright-palette";
import realisticPalette from "../palettes/realistic-palette";
import { logger }       from "../utils/logger";

var palettes = {
    "default":   defaultPalette,
    "bright":    brightPalette,
    "realistic": realisticPalette
};

//=========================================================
// Factory for palette creation
//=========================================================

export class PaletteFactory {

    createPalette(id) {
        var palette = palettes[id];
        if (!palette) {
            throw new Error(`Unsupported palette '${id}'`);
        }
        return palette;
    }

}
