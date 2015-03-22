//=============================================================================
// Test:   instr_test
// Source: http://blargg.8bitalley.com/nes-tests/instr_test-v4.zip
//=============================================================================

import { FakeUnit } from "../../debug/fake-unit"

export const name = "instr_test";
export const rom = "./emulator/core/tests/instr_test/instr_test-v4.nes"

export function configure(config) {
    config["ppu"] = FakeUnit;
    config["apu"] = FakeUnit;
}

export function execute(test) {
    test.blargg();
}
