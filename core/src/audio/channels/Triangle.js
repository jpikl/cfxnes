import {log} from '../../common';
import {LENGTH_COUNTER_VALUES} from './common';

const DUTY_WAVEFORM = [
  15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
];

export default class Triangle {

  constructor() {
    log.info('Initializing triangle channel');
  }

  reset() {
    log.info('Reseting triangle channel');
    this.setEnabled(false);
    this.timerCycle = 0;    // Timer counter value
    this.timerPeriod = 0;   // Timer counter reset value
    this.dutyPosition = 0;  // Output waveform position
    this.linearCounter = 0; // Linear counter value
    this.writeLinearCounter(0);
    this.writeTimer(0);
    this.writeLengthCounter(0);
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!this.enabled) {
      this.lengthCounter = 0; // Disabling channel resets length counter
    }
  }

  //=========================================================
  // Writing
  //=========================================================

  writeLinearCounter(value) {
    this.lengthCounterHalt = (value & 0x80) !== 0;      // Disables length counter decrementation
    this.linearCounterMax = value & 0x7F;               // Linear counter initial value
    this.linearCounterControl = this.lengthCounterHalt; // Linear counter control flag (length counter halt alias)
  }

  writeTimer(value) {
    this.timerPeriod = (this.timerPeriod & 0x700) | (value & 0xFF); // Lower 8 bits of timer
  }

  writeLengthCounter(value) {
    this.timerPeriod = (this.timerPeriod & 0x0FF) | ((value & 0x7) << 8); // Higher 3 bits of timer
    if (this.enabled) {
      this.lengthCounter = LENGTH_COUNTER_VALUES[(value & 0xF8) >>> 3]; // Length counter update
    }
    this.linearCounterReset = true; // Linear counter will be reseted
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
    return DUTY_WAVEFORM[this.dutyPosition]; // Silencing channel does not change output value
  }

}
