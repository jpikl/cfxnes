//=============================================================================
// Test:   instr_timing
// Source: http://blargg.8bitalley.com/parodius/nes-tests/instr_timing.zip
//=============================================================================

import { FakeUnit } from "../../../src/lib/core/debug/fake-unit"

export const name = "instr_timing";
export const rom = "./test/roms/instr_timing/instr_timing.nes"

export function configure(config) {
    config["ppu"] = {type: "class", value: FakeUnit};
}

export function execute(test) {
    test.blargg();
}
