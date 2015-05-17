import { logger } from "../utils/logger";

const TOTAL_DMA_CYCLES = 0x200; // Total 512 CPU cycles for DMA transfer

//=========================================================
// Direct memory access unit
//=========================================================

export class DMA {

    constructor() {
        this.dependencies = ["cpuMemory"];
    }

    init(cpuMemory) {
        this.cpuMemory = cpuMemory;
    }

    powerUp() {
        logger.info("Reseting DMA");
        this.cyclesCount = TOTAL_DMA_CYCLES;
    }

    writeAddress(address) {
        this.cyclesCount = 0;
        this.baseAddress = address << 8; // Source memory address (multiplied by 0x100)
    }

    tick() {
        if (this.isBlockingCPU()) {
            this.cyclesCount++;
            if (this.cyclesCount & 1) {
                this.transferData(); // Each even tick
            }
        }
    }

    isBlockingCPU() {
        return this.cyclesCount < TOTAL_DMA_CYCLES;
    }

    transferData() {
        var address = this.baseAddress + (this.cyclesCount >> 1);
        var data = this.cpuMemory.read(address);
        this.cpuMemory.write(0x2004, data);
    }

}
