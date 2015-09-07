import APU from '../../src/lib/core/units/APU';
import PPU from '../../src/lib/core/units/PPU';
import CPUMemory from '../../src/lib/core/units/CPUMemory';
import { newByteArray } from '../../src/lib/core/utils/system';

export { default as LoggingCPU } from '../../src/lib/core/debug/LoggingCPU';
export { default as NoOutputPPU } from '../../src/lib/core/debug/NoOutputPPU';
export { default as BufferedOutputPPU } from '../../src/lib/core/debug/BufferedOutputPPU';

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
