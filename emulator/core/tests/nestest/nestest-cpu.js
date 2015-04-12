import { DebugCPU } from "../../debug/debug-cpu";

//=========================================================
// CPU mofified to execute all tests on nestest ROM
//=========================================================

export class NestestCPU extends DebugCPU {

    handleReset() {
        super.handleReset();
        this.programCounter = 0xC000;
    }

}
