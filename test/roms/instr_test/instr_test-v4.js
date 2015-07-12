//=============================================================================
// Test:   instr_test
// Source: http://blargg.8bitalley.com/nes-tests/instr_test-v4.zip
//=============================================================================

import { FakeUnit } from "../../../src/lib/core/debug/fake-unit"

export const name = "instr_test";
export const rom = "./test/roms/instr_test/instr_test-v4.nes"

export function configure(config) {
    config["ppu"] = {type: "class", value: FakeUnit};
    config["apu"] = {type: "class", value: FakeUnit};
}

export function execute(test) {
    test.blargg();
}
