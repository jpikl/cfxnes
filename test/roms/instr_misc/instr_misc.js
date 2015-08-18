//=============================================================================
// Test:   instr_misc
// Source: http://blargg.8bitalley.com/parodius/nes-tests/nes_instr_misc.zip
//=============================================================================

import { RAMEnabledCPUMemory, DisabledAPU, DisabledPPU } from "../units"

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
    config["cpuMemory"] = {type: "class", value: RAMEnabledCPUMemory};
    config["apu"] = {type: "class", value: DisabledAPU};
    config["ppu"] = {type: "class", value: DisabledPPU};
}

export function execute(test) {
    test.blargg();
}
