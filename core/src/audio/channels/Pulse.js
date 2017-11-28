import {log} from '../../common';
import {LENGTH_COUNTER_VALUES} from './constants';

const DUTY_WAVEFORMS = [
  [0, 1, 0, 0, 0, 0, 0, 0], // _X______ (12.5%)
  [0, 1, 1, 0, 0, 0, 0, 0], // _XX_____ (25%)
  [0, 1, 1, 1, 1, 0, 0, 0], // _XXXX___ (50%)
  [1, 0, 0, 1, 1, 1, 1, 1], // X__XXXXX (25% negated)
];

export default class Pulse {

  constructor(id) {
    log.info(`Initializing pulse channel #${id}`);

    this.id = id;         // Pulse channel ID
    this.enabled = false; // Channel enablement
    this.gain = 1;        // Output gain

    this.timerCycle = 0;  // Timer counter value
    this.timerPeriod = 0; // Timer counter reset value

    this.lengthCounter = 0;         // Length counter value
    this.lengthCounterHalt = false; // Disables length counter decrease

    this.useConstantVolume = false; // Whether constant instead of envelope volume is used
    this.constantVolume = 0;        // Constant volume value

    this.envelopeReset = false; // Envelope cycle/volume reset request
    this.envelopeCycle = 0;     // Envelope divider counter
    this.envelopeVolume = 0;    // Envelope volume value
    this.envelopeLoop = false;  // Envelope looping flag (alias for lengthCounterHalt)
    this.envelopePeriod = 0;    // Envelope duration period (alias for constantVolume)

    this.sweepEnabled = false; // Sweep enablement
    this.sweepCycle = 0;       // Sweep counter
    this.sweepReset = false;   // Sweep counter reset request
    this.sweepNegate = false;  // Whether sweep is subtracted from timer period (instead of added to)
    this.sweepPeriod = 0;      // Period after which sweep is applied
    this.sweepShift = 0;       // Shift of timer period when computing sweep

    this.dutyPosition = 0;  // Output waveform position
    this.dutySelection = 0; // Selects output waveform
  }

  reset() {
    log.info(`Resetting pulse channel #${this.id}`);

    this.timerCycle = 0;
    this.timerPeriod = 0;
    this.envelopeCycle = 0;
    this.envelopeVolume = 0;
    this.sweepCycle = 0;

    this.setEnabled(false);
    this.writeDutyEnvelope(0);
    this.writeSweep(0);
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

  writeDutyEnvelope(value) {
    this.dutySelection = (value & 0xC0) >>> 6;
    this.lengthCounterHalt = (value & 0x20) !== 0;
    this.useConstantVolume = (value & 0x10) !== 0;
    this.constantVolume = value & 0x0F;
    this.envelopeLoop = this.lengthCounterHalt; // Alias for lengthCounterHalt
    this.envelopePeriod = this.constantVolume;  // Alias for constantVolume
  }

  writeSweep(value) {
    this.sweepEnabled = (value & 0x80) !== 0;
    this.sweepPeriod = (value & 0x70) >>> 4;
    this.sweepNegate = (value & 0x08) !== 0;
    this.sweepShift = value & 0x07;
    this.sweepReset = true;
  }

  writeTimer(value) {
    this.timerPeriod = (this.timerPeriod & 0x700) | (value & 0xFF); // Lower 8 bits of timer
  }

  writeLengthCounter(value) {
    if (this.enabled) {
      this.lengthCounter = LENGTH_COUNTER_VALUES[(value & 0xF8) >>> 3];
    }
    this.timerPeriod = (this.timerPeriod & 0x0FF) | ((value & 0x7) << 8); // Higher 3 bits of timer
    this.dutyPosition = 0;
    this.envelopeReset = true;
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
      // Pulse channel 1 uses one's complement instead of the expected two's complement
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
      return this.gain * volume * DUTY_WAVEFORMS[this.dutySelection][this.dutyPosition];
    }
    return 0;
  }

}
