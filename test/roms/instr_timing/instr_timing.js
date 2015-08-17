//=============================================================================
// Test:   instr_timing
// Source: http://blargg.8bitalley.com/parodius/nes-tests/instr_timing.zip
//=============================================================================

import { TestCPUMemory } from "../test-cpu-memory"
import { FakeUnit }      from "../../../src/lib/core/debug/fake-unit"

export const names = [
    "instr_timing (1-instr_timing)",
    "instr_timing (2-branch_timing)"
];

export const files = [
    "./test/roms/instr_timing/1-instr_timing.nes",
    "./test/roms/instr_timing/2-branch_timing.nes"
];

export function configure(config) {
    config["cpuMemory"] = {type: "class", value: TestCPUMemory};
    config["ppu"] = {type: "class", value: FakeUnit};
}

export function execute(test) {
    test.blargg();
}
