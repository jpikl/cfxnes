import log from '../common/log';
import {formatSize} from '../common/utils';
import {IRQ_APU} from '../proc/interrupts';
import PulseChannel from './PulseChannel';
import TriangleChannel from './TriangleChannel';
import NoiseChannel from './NoiseChannel';
import DMCChannel from './DMCChannel';

// Channel IDs
const PULSE_1 = 0;
const PULSE_2 = 1;
const TRIANGLE = 2;
const NOISE = 3;
const DMC = 4;

export default class APU {

  //=========================================================
  // Initialization
  //=========================================================

  constructor() {
    log.info('Initializing APU');
    this.pulseChannel1 = new PulseChannel(1);
    this.pulseChannel2 = new PulseChannel(2);
    this.triangleChannel = new TriangleChannel;
    this.noiseChannel = new NoiseChannel;
    this.dmcChannel = new DMCChannel;
    this.channelVolumes = [1, 1, 1, 1, 1];
    this.setOutputEnabled(false);
  }

  connect(nes) {
    log.info('Connecting APU');
    this.cpu = nes.cpu;
    this.dmcChannel.connect(nes);
  }

  //=========================================================
  // Reset
  //=========================================================

  reset() {
    log.info('Reseting APU');
    this.clearFrameIRQ();
    this.pulseChannel1.reset();
    this.pulseChannel2.reset();
    this.triangleChannel.reset();
    this.noiseChannel.reset();
    this.dmcChannel.reset();
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
    this.noiseChannel.setRegionParams(params);
    this.dmcChannel.setRegionParams(params);
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

  setChannelVolume(id, volume) {
    log.info(`Setting volume of APU channel #${id} to ${volume}`);
    this.channelVolumes[id] = volume;
  }

  getChannelVolume(id) {
    return this.channelVolumes[id];
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
    this.getPulseChannel(id).writeDutyEnvelope(value);
  }

  writePulseSweep(id, value) {
    this.getPulseChannel(id).writeSweep(value);
  }

  writePulseTimer(id, value) {
    this.getPulseChannel(id).writeTimer(value);
  }

  writePulseLengthCounter(id, value) {
    this.getPulseChannel(id).writeLengthCounter(value);
  }

  getPulseChannel(id) {
    return (id === 1) ? this.pulseChannel1 : this.pulseChannel2;
  }

  //=========================================================
  // Triangle channel registers
  //=========================================================

  writeTriangleLinearCounter(value) {
    this.triangleChannel.writeLinearCounter(value);
  }

  writeTriangleTimer(value) {
    this.triangleChannel.writeTimer(value);
  }

  writeTriangleLengthCounter(value) {
    this.triangleChannel.writeLengthCounter(value);
  }

  //=========================================================
  // Noise channel registers
  //=========================================================

  writeNoiseEnvelope(value) {
    this.noiseChannel.writeEnvelope(value);
  }

  writeNoiseTimer(value) {
    this.noiseChannel.writeTimer(value);
  }

  writeNoiseLengthCounter(value) {
    this.noiseChannel.writeLengthCounter(value);
  }

  //=========================================================
  // DMC channel registers
  //=========================================================

  writeDMCFlagsTimer(value) {
    this.dmcChannel.writeFlagsTimer(value);
  }

  writeDMCOutputLevel(value) {
    this.dmcChannel.writeOutputLevel(value);
  }

  writeDMCSampleAddress(value) {
    this.dmcChannel.writeSampleAddress(value);
  }

  writeDMCSampleLength(value) {
    this.dmcChannel.writeSampleLength(value);
  }

  //=========================================================
  // Status register ($4015)
  //=========================================================

  writeStatus(value) {
    this.pulseChannel1.setEnabled((value & 0x01) !== 0);
    this.pulseChannel2.setEnabled((value & 0x02) !== 0);
    this.triangleChannel.setEnabled((value & 0x04) !== 0);
    this.noiseChannel.setEnabled((value & 0x08) !== 0);
    this.dmcChannel.setEnabled((value & 0x10) !== 0);
  }

  readStatus() {
    const value = this.getStatus();
    this.clearFrameIRQ();
    return value;
  }

  getStatus() {
    return (this.pulseChannel1.lengthCounter > 0)
       | ((this.pulseChannel2.lengthCounter > 0) << 1)
       | ((this.triangleChannel.lengthCounter > 0) << 2)
       | ((this.noiseChannel.lengthCounter > 0) << 3)
       | ((this.dmcChannel.sampleRemainingLength > 0) << 4)
       | ((this.frameIrqActive) << 6)
       | ((this.dmcChannel.irqActive) << 7);
  }

  //=========================================================
  // CPU/DMA lock
  //=========================================================

  isBlockingCPU() {
    return this.dmcChannel.memoryAccessCycles > 0;
  }

  isBlockingDMA() {
    return this.dmcChannel.memoryAccessCycles > 2;
  }

  //=========================================================
  // Tick
  //=========================================================

  tick() {
    this.tickFrameCounter();
    this.pulseChannel1.tick();
    this.pulseChannel2.tick();
    this.triangleChannel.tick();
    this.noiseChannel.tick();
    this.dmcChannel.tick();
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
    this.pulseChannel1.tickQuarterFrame();
    this.pulseChannel2.tickQuarterFrame();
    this.triangleChannel.tickQuarterFrame();
    this.noiseChannel.tickQuarterFrame();
  }

  tickHalfFrame() {
    this.pulseChannel1.tickHalfFrame();
    this.pulseChannel2.tickHalfFrame();
    this.triangleChannel.tickHalfFrame();
    this.noiseChannel.tickHalfFrame();
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
    const volumes = this.channelVolumes;
    const pulse1 = volumes[PULSE_1] * this.pulseChannel1.getOutput();
    const pulse2 = volumes[PULSE_2] * this.pulseChannel2.getOutput();
    const triangle = volumes[TRIANGLE] * this.triangleChannel.getOutput();
    const noise = volumes[NOISE] * this.noiseChannel.getOutput();
    const dmc = volumes[DMC] * this.dmcChannel.getOutput();
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

// Channel IDs - must be specified using string key (closure compiler issue)
APU['PULSE_1'] = PULSE_1;
APU['PULSE_2'] = PULSE_2;
APU['TRIANGLE'] = TRIANGLE;
APU['NOISE'] = NOISE;
APU['DMC'] = DMC;
