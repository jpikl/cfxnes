//=============================================================================
// Test:   ppu_vbl_nmi
// Source: http://blargg.8bitalley.com/parodius/nes-tests/ppu_vbl_nmi.zip
//=============================================================================

import { TestCPUMemory } from "../test-cpu-memory"
import { DebugPPU }      from "../../../src/lib/core/debug/debug-ppu"

export const names = [
    "ppu_vbl_nmi (01-vbl_basics)",
    "ppu_vbl_nmi (02-vbl_set_time)",
    "ppu_vbl_nmi (03-vbl_clear_time)",
    "ppu_vbl_nmi (04-nmi_control)",
    "ppu_vbl_nmi (05-nmi_timing)",
    "ppu_vbl_nmi (06-suppression)",
    "ppu_vbl_nmi (07-nmi_on_timing)",
    "ppu_vbl_nmi (08-nmi_off_timing)",
    "ppu_vbl_nmi (09-even_odd_frames)",
    "ppu_vbl_nmi (10-even_odd_timing)"
];

export const files = [
    "./test/roms/ppu_vbl_nmi/01-vbl_basics.nes",
    "./test/roms/ppu_vbl_nmi/02-vbl_set_time.nes",
    "./test/roms/ppu_vbl_nmi/03-vbl_clear_time.nes",
    "./test/roms/ppu_vbl_nmi/04-nmi_control.nes",
    "./test/roms/ppu_vbl_nmi/05-nmi_timing.nes",
    "./test/roms/ppu_vbl_nmi/06-suppression.nes",
    "./test/roms/ppu_vbl_nmi/07-nmi_on_timing.nes",
    "./test/roms/ppu_vbl_nmi/08-nmi_off_timing.nes",
    "./test/roms/ppu_vbl_nmi/09-even_odd_frames.nes",
    "./test/roms/ppu_vbl_nmi/10-even_odd_timing.nes"
];

export function configure(config) {
    config["cpuMemory"] = {type: "class", value: TestCPUMemory};
    config["ppu"] = {type: "class", value: DebugPPU};
}

export function execute(test) {
    test.blargg();
}
