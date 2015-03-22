import defaultPalette from "../palettes/default-palette";
import brightPalette from "../palettes/bright-palette";
import realisticPalette from "../palettes/realistic-palette";
import { logger } from "../utils/logger";

//=========================================================
// Factory for palette creation
//=========================================================

export class PaletteFactory {

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
