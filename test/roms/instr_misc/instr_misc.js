//=============================================================================
// Test:   instr_misc
// Source: http://blargg.8bitalley.com/parodius/nes-tests/nes_instr_misc.zip
//=============================================================================

import { TestCPUMemory } from "../test-cpu-memory"
import { FakeUnit }      from "../../../src/lib/core/debug/fake-unit"

export const names = [
    "instr_misc (01-abs_x_wrap)",
    "instr_misc (02-branch_wrap)",
    // "instr_misc (03-dummy_reads)",
    // "instr_misc (04-dummy_reads_apu)"
];

export const files = [
    "./test/roms/instr_misc/01-abs_x_wrap.nes",
    "./test/roms/instr_misc/02-branch_wrap.nes",
    // "./test/roms/instr_misc/03-dummy_reads.nes",
    // "./test/roms/instr_misc/04-dummy_reads_apu.nes"
];

export function configure(config) {
    config["cpuMemory"] = {type: "class", value: TestCPUMemory};
    config["ppu"] = {type: "class", value: FakeUnit};
    config["apu"] = {type: "class", value: FakeUnit};
}

export function execute(test) {
    test.blargg();
}
