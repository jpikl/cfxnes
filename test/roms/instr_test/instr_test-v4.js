//=============================================================================
// Test:   instr_test
// Source: http://blargg.8bitalley.com/nes-tests/instr_test-v4.zip
//=============================================================================

import { TestCPUMemory } from "../test-cpu-memory"
import { FakeUnit }      from "../../../src/lib/core/debug/fake-unit"

export const names = [
    "instr_test (01-basics)",
    "instr_test (02-implied)",
    "instr_test (03-immediate)",
    "instr_test (04-zero_page)",
    "instr_test (05-zp_xy)",
    "instr_test (06-absolute)",
    "instr_test (07-abs_xy)",
    "instr_test (08-ind_x)",
    "instr_test (09-ind_y)",
    "instr_test (10-branches)",
    "instr_test (11-stack)",
    "instr_test (12-jmp_jsr)",
    "instr_test (13-rts)",
    "instr_test (14-rti)",
    "instr_test (15-brk)",
    "instr_test (16-special)"
];

export const files = [
    "./test/roms/instr_test/01-basics.nes",
    "./test/roms/instr_test/02-implied.nes",
    "./test/roms/instr_test/03-immediate.nes",
    "./test/roms/instr_test/04-zero_page.nes",
    "./test/roms/instr_test/05-zp_xy.nes",
    "./test/roms/instr_test/06-absolute.nes",
    "./test/roms/instr_test/07-abs_xy.nes",
    "./test/roms/instr_test/08-ind_x.nes",
    "./test/roms/instr_test/09-ind_y.nes",
    "./test/roms/instr_test/10-branches.nes",
    "./test/roms/instr_test/11-stack.nes",
    "./test/roms/instr_test/12-jmp_jsr.nes",
    "./test/roms/instr_test/13-rts.nes",
    "./test/roms/instr_test/14-rti.nes",
    "./test/roms/instr_test/15-brk.nes",
    "./test/roms/instr_test/16-special.nes"
];

export function configure(config) {
    config["cpuMemory"] = {type: "class", value: TestCPUMemory};
    config["ppu"] = {type: "class", value: FakeUnit};
    config["apu"] = {type: "class", value: FakeUnit};
}

export function execute(test) {
    test.blargg();
}
