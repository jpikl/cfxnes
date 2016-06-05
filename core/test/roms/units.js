import APU from '../../src/units/APU';
import PPU from '../../src/units/PPU';

export {default as LoggingCPU} from '../../src/debug/LoggingCPU';
export {default as NoOutputPPU} from '../../src/debug/NoOutputPPU';
export {default as BufferedOutputPPU} from '../../src/debug/BufferedOutputPPU';

//=========================================================
// Customized units for tests
//=========================================================

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
