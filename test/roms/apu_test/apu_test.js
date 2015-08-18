//=============================================================================
// Test:   apu_test
// Source: http://blargg.8bitalley.com/parodius/nes-tests/apu_test.zip
//=============================================================================

import { RAMEnabledCPUMemory, DisabledPPU } from "../units"

export const names = [
    "apu_test (1-len_ctr)",
    "apu_test (2-len_table)",
    "apu_test (3-irq_flag)",
    // "apu_test (4-jitter)",
    "apu_test (5-len_timing)",
    "apu_test (6-irq_flag_timing)",
    // "apu_test (7-dmc_basics)",
    // "apu_test (8-dmc_rates)"
];

export const files = [
    "./test/roms/apu_test/1-len_ctr.nes",
    "./test/roms/apu_test/2-len_table.nes",
    "./test/roms/apu_test/3-irq_flag.nes",
    // "./test/roms/apu_test/4-jitter.nes",
    "./test/roms/apu_test/5-len_timing.nes",
    "./test/roms/apu_test/6-irq_flag_timing.nes",
    // "./test/roms/apu_test/7-dmc_basics.nes",
    // "./test/roms/apu_test/8-dmc_rates.nes"
];

export function configure(config) {
    config["cpuMemory"] = {type: "class", value: RAMEnabledCPUMemory};
    config["ppu"] = {type: "class", value: DisabledPPU};
}

export function execute(test) {
    test.blargg();
}
