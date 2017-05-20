import {log} from '../../common';
import {LENGTH_COUNTER_VALUES} from './common';

const DUTY_WAVEFORMS = [
  [0, 1, 0, 0, 0, 0, 0, 0], // _X______ (12.5%)
  [0, 1, 1, 0, 0, 0, 0, 0], // _XX_____ (25%)
  [0, 1, 1, 1, 1, 0, 0, 0], // _XXXX___ (50%)
  [1, 0, 0, 1, 1, 1, 1, 1], // X__XXXXX (25% negated)
];

export default class Pulse {

  constructor(id) {
    log.info(`Initializing pulse channel #${id}`);
    this.id = id;
  }

  reset() {
    log.info(`Reseting pulse channel #${this.id}`);
    this.setEnabled(false);
    this.timerCycle = 0;     // Timer counter value
    this.timerPeriod = 0;    // Timer counter reset value
    this.envelopeCycle = 0;  // Envelope divider counter
    this.envelopeVolume = 0; // Envelope volume value
    this.sweepCycle = 0;     // Sweep counter
    this.writeDutyEnvelope(0);
    this.writeSweep(0);
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

  writeDutyEnvelope(value) {
    this.dutySelection = (value & 0xC0) >>> 6;     // Selects output waveform
    this.lengthCounterHalt = (value & 0x20) !== 0; // Disables length counter decrementation
    this.useConstantVolume = (value & 0x10) !== 0; // 0 - envelope volume is used / 1 - constant volume is used
    this.constantVolume = value & 0x0F;            // Constant volume value
    this.envelopeLoop = this.lengthCounterHalt;    // Envelope is looping (length counter hold alias)
    this.envelopePeriod = this.constantVolume;     // Envelope duration period (constant volume alias)
  }

  writeSweep(value) {
    this.sweepEnabled = (value & 0x80) !== 0; // Sweeping enabled
    this.sweepPeriod = (value & 0x70) >>> 4;  // Period after which sweep is applied
    this.sweepNegate = (value & 0x08) !== 0;  // 0 - sweep is added to timer period / 1 - sweep is subtracted from timer period
    this.sweepShift = value & 0x07;           // Shift of timer period when computing sweep
    this.sweepReset = true;                   // Sweep counter will be reseted
  }

  writeTimer(value) {
    this.timerPeriod = (this.timerPeriod & 0x700) | (value & 0xFF); // Lower 8 bits of timer
  }

  writeLengthCounter(value) {
    this.timerPeriod = (this.timerPeriod & 0x0FF) | ((value & 0x7) << 8); // Higher 3 bits of timer
    if (this.enabled) {
      this.lengthCounter = LENGTH_COUNTER_VALUES[(value & 0xF8) >>> 3]; // Length counter update
    }
    this.dutyPosition = 0;     // Output waveform position is reseted
    this.envelopeReset = true; // Envelope and its divider will be reseted
  }

  //=========================================================
  // Tick
  //=========================================================

  tick() {
    if (--this.timerCycle <= 0) {
      this.timerCycle = (this.timerPeriod + 1) << 1; // Ticks twice slower than CPU
      this.dutyPosition = (this.dutyPosition + 1) & 0x7;
    }
  }

  tickQuarterFrame() {
    this.updateEnvelope();
  }

  tickHalfFrame() {
    this.updateLengthCounter();
    this.updateSweep();
  }

  //=========================================================
  // Update
  //=========================================================

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

  updateSweep() {
    if (this.sweepCycle > 0) {
      this.sweepCycle--;
    } else {
      if (this.sweepEnabled && this.sweepShift && this.isTimerPeriodValid()) {
        this.timerPeriod += this.getSweep();
      }
      this.sweepCycle = this.sweepPeriod;
    }
    if (this.sweepReset) {
      this.sweepReset = false;
      this.sweepCycle = this.sweepPeriod;
    }
  }

  getSweep() {
    const sweep = this.timerPeriod >>> this.sweepShift;
    if (this.sweepNegate) {
      // Square channel 1 uses one's complement instead of the expected two's complement
      return this.id === 1 ? ~sweep : -sweep;
    }
    return sweep;
  }

  isTimerPeriodValid() {
    return this.timerPeriod >= 0x8 && this.timerPeriod + this.getSweep() < 0x800;
  }

  //=========================================================
  // Output
  //=========================================================

  getOutput() {
    if (this.lengthCounter && this.isTimerPeriodValid()) {
      const volume = this.useConstantVolume ? this.constantVolume : this.envelopeVolume;
      return volume * DUTY_WAVEFORMS[this.dutySelection][this.dutyPosition];
    }
    return 0;
  }

}
