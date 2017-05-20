import {log} from '../../common';
import {LENGTH_COUNTER_VALUES} from './common';

export default class Noise {

  constructor() {
    log.info('Initializing noise channel');
  }

  reset() {
    log.info('Reseting noise channel');
    this.setEnabled(false);
    this.timerCycle = 0;     // Timer counter value
    this.envelopeCycle = 0;  // Envelope divider counter
    this.envelopeVolume = 0; // Envelope volume value
    this.shiftRegister = 1;  // Shift register for random noise generation (must be 1 on start)
    this.writeEnvelope(0);
    this.writeTimer(0);
    this.writeLengthCounter(0);
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!this.enabled) {
      this.lengthCounter = 0; // Disabling channel resets length counter
    }
  }

  setRegionParams(params) {
    this.timerPeriods = params.noiseChannelTimerPeriods;
  }

  //=========================================================
  // Writing
  //=========================================================

  writeEnvelope(value) {
    this.lengthCounterHalt = (value & 0x20) !== 0; // Disables length counter decrementation
    this.useConstantVolume = (value & 0x10) !== 0; // 0 - envelope volume is used / 1 - constant volume is used
    this.constantVolume = value & 0x0F;            // Constant volume value
    this.envelopeLoop = this.lengthCounterHalt;    // Envelope is looping (length counter hold alias)
    this.envelopePeriod = this.constantVolume;     // Envelope duration period (constant volume alias)
  }

  writeTimer(value) {
    this.timerMode = (value & 0x80) !== 0;              // Noise generation mode
    this.timerPeriod = this.timerPeriods[value & 0x0F]; // Timer counter reset value
  }

  writeLengthCounter(value) {
    if (this.enabled) {
      this.lengthCounter = LENGTH_COUNTER_VALUES[(value & 0xF8) >>> 3]; // Length counter update
    }
    this.envelopeReset = true; // Envelope and its divider will be reseted
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
      return this.useConstantVolume ? this.constantVolume : this.envelopeVolume;
    }
    return 0;
  }

}
