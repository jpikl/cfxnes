import {log} from '../../common';
import {IRQ_DMC} from '../../proc/interrupts';

export default class DMC {

  constructor() {
    log.info('Initializing DMC channel');
  }

  connect(nes) {
    log.info('Connecting DMC channel');
    this.cpu = nes.cpu;
    this.cpuMemory = nes.cpuMemory;
  }

  reset() {
    log.info('Reseting DMC channel');
    this.setEnabled(false);
    this.timerCycle = 0;         // Timer counter value
    this.sampleBuffer = null;    // Buffered sample data from memory (null => data are not available)
    this.shiftRegister = null;   // Shift register for processing buffered sample data (null => output is silenced)
    this.shiftRegisterBits = 0;  // Number of bits remaining in shift register
    this.memoryAccessCycles = 0; // Number of cycles when memory access is restricted to DMC channel
    this.writeFlagsTimer(0);
    this.writeOutputLevel(0);
    this.writeSampleAddress(0);
    this.writeSampleLength(0);
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!this.enabled) {
      this.sampleRemainingLength = 0; // Disabling channel stops sample data reading
    } else if (this.sampleRemainingLength === 0) {
      this.sampleCurrentAddress = this.sampleAddress; // Enabling channel starts sample data reading unless it's already in progress
      this.sampleRemainingLength = this.sampleLength;
    }
    this.cpu.clearInterrupt(IRQ_DMC); // Changing enablement ($4015 write) clears IRQ flag
  }

  setRegionParams(params) {
    this.timerPeriods = params.dmcChannelTimerPeriods;
  }

  //=========================================================
  // Writing
  //=========================================================

  writeFlagsTimer(value) {
    this.irqEnabled = (value & 0x80) !== 0; // IRQ enabled flag
    this.sampleLoop = (value & 0x40) !== 0; // Sample looping flag
    this.timerPeriod = this.timerPeriods[value & 0x0F]; // Timer counter reset value
    if (!this.irqEnabled) {
      this.cpu.clearInterrupt(IRQ_DMC); // Disabling IRQ clears IRQ flag
    }
  }

  writeOutputLevel(value) {
    this.output = value & 0x7F; // Direct output level
  }

  writeSampleAddress(value) {
    this.sampleAddress = 0xC000 | ((value & 0xFF) << 6); // Address is constructed as 11AAAAAA.AA000000 where AAAAAAAA are bits of written value
  }

  writeSampleLength(value) {
    this.sampleLength = ((value & 0xFF) << 4) | 0x01; // Length is constructed as LLLL.LLLL0001 where LLLLLLLL are bits of written value
  }

  //=========================================================
  // Tick
  //=========================================================

  tick() {
    if (this.memoryAccessCycles > 0) {
      this.memoryAccessCycles--;
    }
    if (--this.timerCycle <= 0) {
      this.timerCycle = this.timerPeriod;
      this.updateSample();
    }
  }

  //=========================================================
  // Update
  //=========================================================

  updateSample() {
    this.updateSampleBuffer();
    this.updateShiftRegister();
    this.updateOutput();
  }

  updateSampleBuffer() {
    // Read the next sample into buffer when the buffer is empty and the read is requested
    if (this.sampleBuffer === null && this.sampleRemainingLength > 0) {
      this.sampleBuffer = this.cpuMemory.read(this.sampleCurrentAddress);
      this.memoryAccessCycles = 4; // DMC channel will access memory at most for 4 CPU cycles
      if (this.sampleCurrentAddress < 0xFFFF) {
        this.sampleCurrentAddress++;
      } else {
        this.sampleCurrentAddress = 0x8000; // Address increment wrap
      }
      if (--this.sampleRemainingLength <= 0) {
        if (this.sampleLoop) {
          this.sampleCurrentAddress = this.sampleAddress; // Re-read the same sample
          this.sampleRemainingLength = this.sampleLength;
        } else if (this.irqEnabled) {
          this.cpu.activateInterrupt(IRQ_DMC); // Reading of sample was finished
        }
      }
    }
  }

  updateShiftRegister() {
    // Countinuous reload of buffer into shift register (even when the output is silenced)
    if (--this.shiftRegisterBits <= 0) {
      this.shiftRegisterBits = 8;
      this.shiftRegister = this.sampleBuffer;
      this.sampleBuffer = null;
    }
  }

  updateOutput() {
    // Update output value from bit 0 of the shift register
    if (this.shiftRegister !== null) {
      if (this.shiftRegister & 1) {
        if (this.output <= 125) {
          this.output += 2; // Max. value is 127
        }
      } else if (this.output >= 2) {
        this.output -= 2; // Min. value is 0
      }
      this.shiftRegister >>>= 1;
    }
  }

  //=========================================================
  // Output
  //=========================================================

  getOutput() {
    return this.output;
  }

}
