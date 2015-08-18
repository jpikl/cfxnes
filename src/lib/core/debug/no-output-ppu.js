import { PPU } from "../units/ppu";

//=========================================================
// PPU with disabled output generation
//=========================================================

export class NoOutputPPU extends PPU {

    updatePalette() {
    }

    setFramePixel() {
    }

    clearFramePixel() {
    }

}
