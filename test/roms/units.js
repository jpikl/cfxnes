import { APU }          from "../../src/lib/core/units/apu";
import { CPUMemory }    from "../../src/lib/core/units/cpu-memory";
import { PPU }          from "../../src/lib/core/units/ppu";
import { newByteArray } from "../../src/lib/core/utils/system";

export { LoggingCPU }  from "../../src/lib/core/debug/logging-cpu";
export { NoOutputPPU } from "../../src/lib/core/debug/no-output-ppu";

//=========================================================
// Customized units for tests
//=========================================================

export class RAMEnabledCPUMemory extends CPUMemory {

    remapPRGRAM(mapper) {
        // Some ROM images expect 8K PRG RAM
        this.prgRAM = mapper.prgRAM || newByteArray(0x2000);
    }

}

export class DisabledPPU extends PPU {

    tick() {
        // For faster test execution where PPU is not needed
    }

    updatePalette() {
    }

}

export class DisabledAPU extends APU {

    tick() {
        // For faster test execution where APU is not needed
    }

}
