import {log} from '../../common';
import {IRQ_DMC} from '../../proc/interrupts';

export default class DMC {

  constructor() {
    log.info('Initializing DMC channel');

    this.enabled = false; // Channel enablement
    this.output = 0;      // Output value
    this.gain = 1;        // Output gain

    this.timerCycle = 0;      // Timer counter value
    this.timerPeriod = 0;     // Timer counter reset value
    this.timerPeriods = null; // Array of possible timerPeriod values (values depend on region)

    this.sampleAddress = 0;         // Starting address where samples are being read
    this.sampleLength = 0;          // Total length of samples being read
    this.sampleCurrentAddress = 0;  // Current address where sables are being read
    this.sampleRemainingLength = 0; // Number of remaining samples to read
    this.sampleLoop = false;        // Sample looping flag
    this.sampleBuffer = -1;         // Buffered sample data from memory (negative value = data are not available)

    this.shiftRegister = -1;     // Shift register for processing buffered sample data (negative value = output is silenced)
    this.shiftRegisterBits = 0;  // Number of bits remaining in shift register
    this.memoryAccessCycles = 0; // Number of cycles when memory access is restricted to DMC channel
    this.irqEnabled = false;     // IWhether IRQ is enabled
    this.irqActive = false;      // Whether IRQ is active

    this.cpu = null;
    this.cpuMemory = null;
  }

  connect(nes) {
    log.info('Connecting DMC channel');
    this.cpu = nes.cpu;
    this.cpuMemory = nes.cpuMemory;
  }

  reset() {
    log.info('Resetting DMC channel');

    this.timerCycle = 0;
    this.sampleBuffer = -1;
    this.shiftRegister = -1;
    this.shiftRegisterBits = 0;
    this.memoryAccessCycles = 0;

    this.setEnabled(false);
    this.writeFlagsTimer(0);
    this.writeOutputLevel(0);
    this.writeSampleAddress(0);
    this.writeSampleLength(0);
  }

  setEnabled(enabled) {
    if (!enabled) {
      // Disabling channel stops sample data reading
      this.sampleRemainingLength = 0;
    } else if (this.sampleRemainingLength === 0) {
      // Enabling channel starts sample data reading unless it's already in progress
      this.sampleCurrentAddress = this.sampleAddress;
      this.sampleRemainingLength = this.sampleLength;
    }
    this.enabled = enabled;
    this.clearIRQ(); // Changing enablement ($4015 write) clears IRQ flag
  }

  setRegionParams(params) {
    this.timerPeriods = params.dmcChannelTimerPeriods;
  }

  activateIRQ() {
    this.irqActive = true;
    this.cpu.activateInterrupt(IRQ_DMC);
  }

  clearIRQ() {
    this.irqActive = false;
    this.cpu.clearInterrupt(IRQ_DMC);
  }

  //=========================================================
  // Writing
  //=========================================================

  writeFlagsTimer(value) {
    this.irqEnabled = (value & 0x80) !== 0;
    this.sampleLoop = (value & 0x40) !== 0;
    this.timerPeriod = this.timerPeriods[value & 0x0F];

    if (!this.irqEnabled) {
      this.clearIRQ(); // Disabling IRQ clears IRQ flag
    }
  }

  writeOutputLevel(value) {
    this.output = value & 0x7F;
  }

  writeSampleAddress(value) {
    // Address is constructed as 11AAAAAA.AA000000 where AAAAAAAA are bits of written value
    this.sampleAddress = 0xC000 | ((value & 0xFF) << 6);
  }

  writeSampleLength(value) {
    // Length is constructed as LLLL.LLLL0001 where LLLLLLLL are bits of written value
    this.sampleLength = ((value & 0xFF) << 4) | 0x01;
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
    if (this.sampleBuffer < 0 && this.sampleRemainingLength > 0) {
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
          this.activateIRQ(); // Reading of sample was finished
        }
      }
    }
  }

  updateShiftRegister() {
    // Continuous reload of buffer into shift register (even when the output is silenced)
    if (--this.shiftRegisterBits <= 0) {
      this.shiftRegisterBits = 8;
      this.shiftRegister = this.sampleBuffer;
      this.sampleBuffer = -1;
    }
  }

  updateOutput() {
    // Update output value from bit 0 of the shift register
    if (this.shiftRegister >= 0) {
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
    return this.gain * this.output;
  }

}
