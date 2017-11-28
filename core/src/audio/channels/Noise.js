import {log} from '../../common';
import {LENGTH_COUNTER_VALUES} from './constants';

export default class Noise {

  constructor() {
    log.info('Initializing noise channel');

    this.enabled = false; // Channel enablement
    this.gain = 1;        // Output gain

    this.timerMode = false;   // Noise generation mode
    this.timerCycle = 0;      // Timer counter value
    this.timerPeriod = 0;     // Timer counter reset value
    this.timerPeriods = null; // Array of possible timerPeriod values (values depend on region)

    this.lengthCounter = 0;         // Length counter value
    this.lengthCounterHalt = false; // Disables length counter decrease

    this.useConstantVolume = false; // Whether constant instead of envelope volume is used
    this.constantVolume = 0;        // Constant volume value

    this.envelopeReset = false; // Envelope cycle/volume reset request
    this.envelopeCycle = 0;     // Envelope divider counter
    this.envelopeVolume = 0;    // Envelope volume value
    this.envelopeLoop = false;  // Envelope looping flag (alias for lengthCounterHalt)
    this.envelopePeriod = 0;    // Envelope duration period (alias for constantVolume)

    this.shiftRegister = 0; // Shift register for random noise generation
  }

  reset() {
    log.info('Resetting noise channel');

    this.timerCycle = 0;
    this.envelopeCycle = 0;
    this.envelopeVolume = 0;
    this.shiftRegister = 1;  // Must be 1 on reset

    this.setEnabled(false);
    this.writeEnvelope(0);
    this.writeTimer(0);
    this.writeLengthCounter(0);
  }

  setEnabled(enabled) {
    if (!enabled) {
      this.lengthCounter = 0; // Disabling channel resets length counter
    }
    this.enabled = enabled;
  }

  setRegionParams(params) {
    this.timerPeriods = params.noiseChannelTimerPeriods;
  }

  //=========================================================
  // Writing
  //=========================================================

  writeEnvelope(value) {
    this.lengthCounterHalt = (value & 0x20) !== 0;
    this.useConstantVolume = (value & 0x10) !== 0;
    this.constantVolume = value & 0x0F;
    this.envelopeLoop = this.lengthCounterHalt; // Alias for lengthCounterHalt
    this.envelopePeriod = this.constantVolume;  // Alias for constantVolume
  }

  writeTimer(value) {
    this.timerMode = (value & 0x80) !== 0;
    this.timerPeriod = this.timerPeriods[value & 0x0F];
  }

  writeLengthCounter(value) {
    if (this.enabled) {
      this.lengthCounter = LENGTH_COUNTER_VALUES[(value & 0xF8) >>> 3];
    }
    this.envelopeReset = true;
  }

  //=========================================================
  // Tick
  //=========================================================

  tick() {
    if (--this.timerCycle <= 0) {
      this.timerCycle = this.timerPeriod;
      this.updateShiftRegister();
    }
  }

  tickQuarterFrame() {
    this.updateEnvelope();
  }

  tickHalfFrame() {
    this.updateLengthCounter();
  }

  //=========================================================
  // Update
  //=========================================================

  updateShiftRegister() {
    const feedbackPosition = this.timerMode ? 6 : 1;
    const feedbackValue = (this.shiftRegister & 1) ^ ((this.shiftRegister >>> feedbackPosition) & 1);
    this.shiftRegister = (this.shiftRegister >>> 1) | (feedbackValue << 14);
  }

  updateEnvelope() {
    if (this.envelopeReset) {
      this.envelopeReset = false;
      this.envelopeCycle = this.envelopePeriod;
      this.envelopeVolume = 0xF;
    } else if (this.envelopeCycle > 0) {
      this.envelopeCycle--;
    } else {
      this.envelopeCycle = this.envelopePeriod;
      if (this.envelopeVolume > 0) {
        this.envelopeVolume--;
      } else if (this.envelopeLoop) {
        this.envelopeVolume = 0xF;
      }
    }
  }

  updateLengthCounter() {
    if (this.lengthCounter > 0 && !this.lengthCounterHalt) {
      this.lengthCounter--;
    }
  }

  //=========================================================
  // Output
  //=========================================================

  getOutput() {
    if (this.lengthCounter && !(this.shiftRegister & 1)) {
      const volume = this.useConstantVolume ? this.constantVolume : this.envelopeVolume;
      return this.gain * volume;
    }
    return 0;
  }

}
