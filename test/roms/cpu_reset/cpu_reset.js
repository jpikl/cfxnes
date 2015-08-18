//=============================================================================
// Test:   cpu_reset
// Source: http://blargg.8bitalley.com/parodius/nes-tests/cpu_reset.zip
//=============================================================================

import { TestCPUMemory } from "../test-cpu-memory"
import { FakeUnit }      from "../../../src/lib/core/debug/fake-unit"

export const names = [
    "cpu_reset (ram_after_reset)",
    "cpu_reset (registers)"
];

export const files = [
    "./test/roms/cpu_reset/ram_after_reset.nes",
    "./test/roms/cpu_reset/registers.nes"
];

export function configure(config) {
    config["cpuMemory"] = {type: "class", value: TestCPUMemory};
    config["ppu"] = {type: "class", value: FakeUnit};
    config["apu"] = {type: "class", value: FakeUnit};
}

export function execute(test) {
    test.blargg();
}
