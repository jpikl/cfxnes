import { CPUMemory }    from "../../src/lib/core/units/cpu-memory";
import { newByteArray } from "../../src/lib/core/utils/system";

//=========================================================
// CPU memory with enabled PRG RAM
//=========================================================

export class TestCPUMemory extends CPUMemory {

    remapPRGRAM(mapper) {
        // Some ROM images expect 8K PRG RAM
        this.prgRAM = mapper.prgRAM || newByteArray(0x2000);
    }

}
