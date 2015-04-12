import { PPU } from "../units/ppu";

//=========================================================
// PPU with disabled output generation
//=========================================================

export class DebugPPU extends PPU {

    updateRGBAPalette() {
    }

    setFramePixel() {
    }

    clearFramePixel() {
    }

}
