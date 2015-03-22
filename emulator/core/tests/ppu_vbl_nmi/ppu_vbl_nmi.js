//=============================================================================
// Test:   ppu_vbl_nmi
// Source: http://blargg.8bitalley.com/parodius/nes-tests/ppu_vbl_nmi.zip
//=============================================================================

import { DebugPPU } from "../../debug/debug-ppu"

export const name = "ppu_vbl_nmi";
export const rom = "./emulator/core/tests/ppu_vbl_nmi/ppu_vbl_nmi.nes"

export function configure(config) {
    config["ppu"] = DebugPPU;
}

export function execute(test) {
    test.blargg();
}
