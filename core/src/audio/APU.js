import {log, formatSize} from '../common';
import {IRQ_APU} from '../proc/interrupts';
import {Pulse, Triangle, Noise, DMC} from './channels';

export const Channel = {
  PULSE_1: 0,
  PULSE_2: 1,
  TRIANGLE: 2,
  NOISE: 3,
  DMC: 4,
};

export default class APU {

  //=========================================================
  // Initialization
  //=========================================================

  constructor() {
    log.info('Initializing APU');
    this.pulse1 = new Pulse(1);
    this.pulse2 = new Pulse(2);
    this.triangle = new Triangle;
    this.noise = new Noise;
    this.dmc = new DMC;
    this.volumes = [1, 1, 1, 1, 1];
    this.setOutputEnabled(false);
  }

  connect(nes) {
    log.info('Connecting APU');
    this.cpu = nes.cpu;
    this.dmc.connect(nes);
  }

  //=========================================================
  // Reset
  //=========================================================

  reset() {
    log.info('Reseting APU');
    this.clearFrameIRQ();
    this.pulse1.reset();
    this.pulse2.reset();
    this.triangle.reset();
    this.noise.reset();
    this.dmc.reset();
    this.writeFrameCounter(0);
  }

  //=========================================================
  // Configuration
  //=========================================================

  setRegionParams(params) {
    log.info('Setting APU region parameters');
    this.frameCounterMax4 = params.frameCounterMax4; // 4-step frame counter
    this.frameCounterMax5 = params.frameCounterMax5; // 5-step frame counter
    this.cpuFrequency = params.cpuFrequency;
    this.noise.setRegionParams(params);
    this.dmc.setRegionParams(params);
  }

  setOutputEnabled(enabled) {
    log.info(`APU output ${enabled ? 'on' : 'off'}`);
    this.outputEnabled = enabled;
  }

  isOutputEnabled() {
    return this.outputEnabled;
  }

  setBufferSize(size) {
    log.info(`Setting APU buffer size to ${formatSize(size)}`);
    this.bufferSize = size;                     // Size of record and output buffer
    this.bufferPosition = 0;                    // Position of the next sample in buffer
    this.bufferIncrement = 0;                   // Sum of increments for the next buffer position
    this.recordBuffer = new Float32Array(size); // Buffer where audio samples are being stored
    this.outputBuffer = new Float32Array(size); // Buffer with audio samples ready to output
    this.outputBufferFull = false;              // Wheter the output buffer is full
  }

  getBufferSize() {
    return this.bufferSize;
  }

  setSampleRate(rate) {
    log.info(`Setting APU sampling rate to ${rate} Hz`);
    this.sampleRate = rate;        // How often are samples taken (samples per second)
    this.sampleRateAdjustment = 0; // Sample rate adjustment per 1 output value (buffer underflow/overflow prevention)
  }

  getSampleRate() {
    return this.sampleRate;
  }

  setVolume(channel, volume) {
    log.info(`Setting volume of APU channel #${channel} to ${volume}`);
    this.volumes[channel] = volume;
  }

  getVolume(channel) {
    return this.volumes[channel];
  }

  //=========================================================
  // Frame counter register ($4017)
  //=========================================================

  writeFrameCounter(value) {
    this.frameCounterLast = value;                 // Used by CPU during reset
    this.frameFiveStepMode = (value & 0x80) !== 0; // 0 - mode 4 (4-step counter) / 1 - mode 5 (5-step counter)
    this.frameIrqDisabled = (value & 0x40) !== 0;  // IRQ generation is inhibited in mode 4
    this.frameStep = 0;                            // Step of the frame counter
    this.frameCounterResetDelay = 4;               // Counter should be reseted after 3 or 4 CPU cycles
    if (this.frameCounter == null) {
      this.frameCounter = this.getFrameCounterMax(); // Frame counter first initialization
    }
    if (this.frameIrqDisabled) {
      this.clearFrameIRQ(); // Disabling IRQ clears IRQ flag
    }
    if (this.frameFiveStepMode) {
      this.tickHalfFrame();
      this.tickQuarterFrame();
    }
  }

  getFrameCounterMax() {
    if (this.frameFiveStepMode) {
      return this.frameCounterMax5[this.frameStep];
    }
    return this.frameCounterMax4[this.frameStep];
  }

  activateFrameIRQ() {
    this.frameIrqActive = true;
    this.cpu.activateInterrupt(IRQ_APU);
  }

  clearFrameIRQ() {
    this.frameIrqActive = false;
    this.cpu.clearInterrupt(IRQ_APU);
  }

  //=========================================================
  // Pulse channel registers
  //=========================================================

  writePulseDutyEnvelope(id, value) {
    this.getPulse(id).writeDutyEnvelope(value);
  }

  writePulseSweep(id, value) {
    this.getPulse(id).writeSweep(value);
  }

  writePulseTimer(id, value) {
    this.getPulse(id).writeTimer(value);
  }

  writePulseLengthCounter(id, value) {
    this.getPulse(id).writeLengthCounter(value);
  }

  getPulse(id) {
    return (id === 1) ? this.pulse1 : this.pulse2;
  }

  //=========================================================
  // Triangle channel registers
  //=========================================================

  writeTriangleLinearCounter(value) {
    this.triangle.writeLinearCounter(value);
  }

  writeTriangleTimer(value) {
    this.triangle.writeTimer(value);
  }

  writeTriangleLengthCounter(value) {
    this.triangle.writeLengthCounter(value);
  }

  //=========================================================
  // Noise channel registers
  //=========================================================

  writeNoiseEnvelope(value) {
    this.noise.writeEnvelope(value);
  }

  writeNoiseTimer(value) {
    this.noise.writeTimer(value);
  }

  writeNoiseLengthCounter(value) {
    this.noise.writeLengthCounter(value);
  }

  //=========================================================
  // DMC channel registers
  //=========================================================

  writeDMCFlagsTimer(value) {
    this.dmc.writeFlagsTimer(value);
  }

  writeDMCOutputLevel(value) {
    this.dmc.writeOutputLevel(value);
  }

  writeDMCSampleAddress(value) {
    this.dmc.writeSampleAddress(value);
  }

  writeDMCSampleLength(value) {
    this.dmc.writeSampleLength(value);
  }

  //=========================================================
  // Status register ($4015)
  //=========================================================

  writeStatus(value) {
    this.pulse1.setEnabled((value & 0x01) !== 0);
    this.pulse2.setEnabled((value & 0x02) !== 0);
    this.triangle.setEnabled((value & 0x04) !== 0);
    this.noise.setEnabled((value & 0x08) !== 0);
    this.dmc.setEnabled((value & 0x10) !== 0);
  }

  readStatus() {
    const value = this.getStatus();
    this.clearFrameIRQ();
    return value;
  }

  getStatus() {
    return (this.pulse1.lengthCounter > 0)
       | ((this.pulse2.lengthCounter > 0) << 1)
       | ((this.triangle.lengthCounter > 0) << 2)
       | ((this.noise.lengthCounter > 0) << 3)
       | ((this.dmc.sampleRemainingLength > 0) << 4)
       | ((this.frameIrqActive) << 6)
       | ((this.dmc.irqActive) << 7);
  }

  //=========================================================
  // CPU/DMA lock
  //=========================================================

  isBlockingCPU() {
    return this.dmc.memoryAccessCycles > 0;
  }

  isBlockingDMA() {
    return this.dmc.memoryAccessCycles > 2;
  }

  //=========================================================
  // Tick
  //=========================================================

  tick() {
    this.tickFrameCounter();
    this.pulse1.tick();
    this.pulse2.tick();
    this.triangle.tick();
    this.noise.tick();
    this.dmc.tick();
    if (this.outputEnabled) {
      this.recordOutput();
    }
  }

  tickFrameCounter() {
    if (this.frameCounterResetDelay && --this.frameCounterResetDelay <= 0) {
      this.frameCounter = this.getFrameCounterMax();
    }
    if (--this.frameCounter <= 0) {
      this.tickFrameStep();
    }
  }

  tickFrameStep() {
    this.frameStep = (this.frameStep + 1) % 6;
    this.frameCounter = this.getFrameCounterMax();
    switch (this.frameStep) {
      case 1:
        this.tickQuarterFrame();
        break;
      case 2:
        this.tickQuarterFrame();
        this.tickHalfFrame();
        break;
      case 3:
        this.tickQuarterFrame();
        break;
      case 4:
        this.tickFrameIRQ();
        break;
      case 5:
        this.tickQuarterFrame();
        this.tickHalfFrame();
        this.tickFrameIRQ();
        break;
      case 0: // 6
        this.tickFrameIRQ();
        break;
    }
  }

  tickQuarterFrame() {
    this.pulse1.tickQuarterFrame();
    this.pulse2.tickQuarterFrame();
    this.triangle.tickQuarterFrame();
    this.noise.tickQuarterFrame();
  }

  tickHalfFrame() {
    this.pulse1.tickHalfFrame();
    this.pulse2.tickHalfFrame();
    this.triangle.tickHalfFrame();
    this.noise.tickHalfFrame();
  }

  tickFrameIRQ() {
    if (!this.frameIrqDisabled && !this.frameFiveStepMode) {
      this.activateFrameIRQ();
    }
  }

  //=========================================================
  // Output
  //=========================================================

  getOutput() {
    const {volumes} = this;
    const pulse1 = volumes[Channel.PULSE_1] * this.pulse1.getOutput();
    const pulse2 = volumes[Channel.PULSE_2] * this.pulse2.getOutput();
    const triangle = volumes[Channel.TRIANGLE] * this.triangle.getOutput();
    const noise = volumes[Channel.NOISE] * this.noise.getOutput();
    const dmc = volumes[Channel.DMC] * this.dmc.getOutput();
    let output = 0;
    if (pulse1 || pulse2) {
      output += 95.88 / ((8128 / (pulse1 + pulse2)) + 100);
    }
    if (triangle || noise || dmc) {
      output += 159.79 / ((1 / ((triangle / 8227) + (noise / 12241) + (dmc / 22638))) + 100);
    }
    return output;
  }

  //=========================================================
  // Recording
  //=========================================================

  recordOutput() {
    this.bufferIncrement += this.sampleRate / this.cpuFrequency;
    if (this.bufferIncrement >= 1) {
      let increment = ~~this.bufferIncrement;
      this.bufferIncrement -= increment;
      const output = this.getOutput();
      while (increment--) {
        if (this.bufferPosition === this.bufferSize) {
          if (this.outputBufferFull) {
            break; // Buffer overflow
          }
          this.swapBuffers();
        }
        this.recordBuffer[this.bufferPosition++] = output;
        this.sampleRate += this.sampleRateAdjustment;
      }
    }
  }

  swapBuffers() {
    [this.recordBuffer, this.outputBuffer] = [this.outputBuffer, this.recordBuffer];
    this.outputBufferFull = true;
    this.bufferPosition = 0;
  }

  readBuffer() {
    if (!this.outputBufferFull) {
      const output = this.getOutput();
      this.recordBuffer.fill(output, this.bufferPosition); // Buffer underflow
      this.swapBuffers();
    }
    this.adjustSampleRate();
    this.outputBufferFull = false;
    return this.outputBuffer;
  }

  adjustSampleRate() {
    // Our goal is to have right now about 50% of data in buffer
    const percentageDifference = 0.5 - (this.bufferPosition / this.bufferSize); // Difference from the expected value
    this.sampleRateAdjustment = 100 * percentageDifference / this.bufferSize; // Adjustment per 1 output value in buffer
  }

}
