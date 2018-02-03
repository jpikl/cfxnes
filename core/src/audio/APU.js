import {log} from '../common';
import {IRQ_APU} from '../proc/interrupts';
import {Pulse, Triangle, Noise, DMC} from './channels';

const TICKS_PER_FRAME = 29829.55; // Number of CPU ticks per one video frame

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
    this.channels = [this.pulse1, this.pulse2, this.triangle, this.noise, this.dmc];

    this.frameCounter = -1;          // Frame counter (negative value = uninitialized)
    this.frameCounterMax4 = null;    // Array of reset values for 4-step frame counter
    this.frameCounterMax5 = null;    // Array of reset values for 5-step frame counter
    this.frameCounterResetDelay = 0; // Number of CPU cycles before frame counter reset
    this.frameCounterLast = 0;       // Last value written to frame counter register (used by CPU during reset)
    this.frameFiveStepMode = false;  // Whether 5-step frame counter is used instead of 4-step one
    this.frameStep = 0;              // Step of frame counter
    this.frameIrqActive = false;     // Whether frame IRQ is active
    this.frameIrqDisabled = false;   // Whether frame IRQ generation is inhibited

    this.sampleRate = 0;     // How often are samples taken (samples per second [Hz])
    this.ticksToOutput = 0;  // Number of ticks before the next output value is generated
    this.ticksPerSecond = 0; // Number of ticks per second
    this.callback = null;    // Callback called when output buffer is full

    this.cpu = null;
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
    log.info('Resetting APU');

    this.pulse1.reset();
    this.pulse2.reset();
    this.triangle.reset();
    this.noise.reset();
    this.dmc.reset();

    this.clearFrameIRQ();
    this.writeFrameCounter(0);
  }

  //=========================================================
  // Configuration
  //=========================================================

  setRegionParams(params) {
    log.info('Setting APU region parameters');

    this.frameCounterMax4 = params.frameCounterMax4;
    this.frameCounterMax5 = params.frameCounterMax5;
    this.ticksPerSecond = TICKS_PER_FRAME * params.framesPerSecond;

    this.noise.setRegionParams(params);
    this.dmc.setRegionParams(params);
  }

  setSampleRate(rate) {
    // No log message here, this might get called quite frequently
    this.sampleRate = rate;
  }

  getSampleRate() {
    return this.sampleRate;
  }

  setCallback(callback) {
    log.info((callback ? 'Setting' : 'Removing') + ' APU callback');
    this.callback = callback;
  }

  getCallback() {
    return this.callback;
  }

  setVolume(id, volume) {
    log.info(`Setting volume of APU channel #${id} to ${volume}`);
    this.channels[id].gain = volume;
  }

  getVolume(id) {
    return this.channels[id].gain;
  }

  //=========================================================
  // Frame counter register ($4017)
  //=========================================================

  writeFrameCounter(value) {
    this.frameCounterLast = value;
    this.frameFiveStepMode = (value & 0x80) !== 0;
    this.frameIrqDisabled = (value & 0x40) !== 0;
    this.frameCounterResetDelay = 4; // Reset after 3 or 4 CPU cycles
    this.frameStep = 0;

    if (this.frameCounter < 0) {
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
    const maxValues = this.frameFiveStepMode
      ? this.frameCounterMax5
      : this.frameCounterMax4;

    return maxValues[this.frameStep];
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

    this.tickOutput();
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

  tickOutput() {
    if (this.callback && --this.ticksToOutput <= 0) {
      this.ticksToOutput += this.ticksPerSecond / this.sampleRate;
      this.callback(this.getOutput());
    }
  }

  getOutput() {
    let output = 0;

    const pulse1 = this.pulse1.getOutput();
    const pulse2 = this.pulse2.getOutput();

    if (pulse1 || pulse2) {
      output += 95.88 / ((8128 / (pulse1 + pulse2)) + 100);
    }

    const triangle = this.triangle.getOutput();
    const noise = this.noise.getOutput();
    const dmc = this.dmc.getOutput();

    if (triangle || noise || dmc) {
      output += 159.79 / ((1 / ((triangle / 8227) + (noise / 12241) + (dmc / 22638))) + 100);
    }

    return output;
  }

}
