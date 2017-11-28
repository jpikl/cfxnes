import {log} from '../../common';
import {LENGTH_COUNTER_VALUES} from './constants';

const DUTY_WAVEFORM = [
  15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
];

export default class Triangle {

  constructor() {
    log.info('Initializing triangle channel');

    this.enabled = false; // Channel enablement
    this.gain = 1;        // Output gain

    this.timerCycle = 0;    // Timer counter value
    this.timerPeriod = 0;   // Timer counter reset value

    this.lengthCounter = 0;         // Length counter value
    this.lengthCounterHalt = false; // Disables length counter decrease

    this.linearCounter = 0;            // Linear counter value
    this.linearCounterMax = 0;         // Linear counter reset value
    this.linearCounterControl = false; // Linear counter control flag (alias for lengthCounterHalt)
    this.linearCounterReset = false;   // Linear counter reset request

    this.dutyPosition = 15; // Output waveform position (15 => initial duty value is 0)
  }

  reset() {
    log.info('Resetting triangle channel');

    this.timerCycle = 0;
    this.timerPeriod = 0;
    this.dutyPosition = 0;
    this.linearCounter = 0;

    this.setEnabled(false);
    this.writeLinearCounter(0);
    this.writeTimer(0);
    this.writeLengthCounter(0);
  }

  setEnabled(enabled) {
    if (!enabled) {
      this.lengthCounter = 0; // Disabling channel resets length counter
    }
    this.enabled = enabled;
  }

  //=========================================================
  // Writing
  //=========================================================

  writeLinearCounter(value) {
    this.lengthCounterHalt = (value & 0x80) !== 0;
    this.linearCounterMax = value & 0x7F;
    this.linearCounterControl = this.lengthCounterHalt; // Alias for lengthCounterHalt
  }

  writeTimer(value) {
    this.timerPeriod = (this.timerPeriod & 0x700) | (value & 0xFF); // Lower 8 bits of timer
  }

  writeLengthCounter(value) {
    if (this.enabled) {
      this.lengthCounter = LENGTH_COUNTER_VALUES[(value & 0xF8) >>> 3];
    }
    this.timerPeriod = (this.timerPeriod & 0x0FF) | ((value & 0x7) << 8); // Higher 3 bits of timer
    this.linearCounterReset = true;
  }

  //=========================================================
  // Tick
  //=========================================================

  tick() {
    if (--this.timerCycle <= 0) {
      this.timerCycle = this.timerPeriod + 1; // Ticks at the same rate as CPU
      if (this.lengthCounter && this.linearCounter && this.timerPeriod > 3) {
        this.dutyPosition = (this.dutyPosition + 1) & 0x1F;
      }
    }
  }

  tickQuarterFrame() {
    this.updateLinearCounter();
  }

  tickHalfFrame() {
    this.updateLengthCounter();
  }

  //=========================================================
  // Update
  //=========================================================

  updateLinearCounter() {
    if (this.linearCounterReset) {
      this.linearCounter = this.linearCounterMax;
    } else if (this.linearCounter > 0) {
      this.linearCounter--;
    }
    if (!this.linearCounterControl) {
      this.linearCounterReset = false;
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
    return this.gain * DUTY_WAVEFORM[this.dutyPosition]; // Silencing channel does not change output value
  }

}
