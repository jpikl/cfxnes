var DUTY_WAVEFORMS, LENGTH_COUNTER_VALUES, logger;

logger = require("../utils/logger").get();

LENGTH_COUNTER_VALUES = require("../common/constants").APU_LENGTH_COUNTER_VALUES;

DUTY_WAVEFORMS = [[0, 1, 0, 0, 0, 0, 0, 0], [0, 1, 1, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 0, 0, 0], [1, 0, 0, 1, 1, 1, 1, 1]];

function PulseChannel(channelId) {
  this.channelId = channelId;
}

PulseChannel.prototype.powerUp = function() {
  logger.info("Reseting pulse channel " + this.channelId);
  this.setEnabled(false);
  this.timerCycle = 0;
  this.timerPeriod = 0;
  this.envelopeCycle = 0;
  this.envelopeVolume = 0;
  this.sweepCycle = 0;
  this.writeDutyEnvelope(0);
  this.writeSweep(0);
  this.writeTimer(0);
  return this.writeLengthCounter(0);
};

PulseChannel.prototype.setEnabled = function(enabled) {
  this.enabled = enabled;
  if (!enabled) {
    return this.lengthCounter = 0;
  }
};

PulseChannel.prototype.writeDutyEnvelope = function(value) {
  this.dutySelection = (value & 0xC0) >>> 6;
  this.lengthCounterHalt = (value & 0x20) !== 0;
  this.useConstantVolume = (value & 0x10) !== 0;
  this.constantVolume = value & 0x0F;
  this.envelopeLoop = this.lengthCounterHalt;
  this.envelopePeriod = this.constantVolume;
  return value;
};

PulseChannel.prototype.writeSweep = function(value) {
  this.sweepEnabled = (value & 0x80) !== 0;
  this.sweepPeriod = (value & 0x70) >>> 4;
  this.sweepNegate = (value & 0x08) !== 0;
  this.sweepShift = value & 0x07;
  this.sweepReset = true;
  return value;
};

PulseChannel.prototype.writeTimer = function(value) {
  this.timerPeriod = (this.timerPeriod & 0x700) | (value & 0xFF);
  return value;
};

PulseChannel.prototype.writeLengthCounter = function(value) {
  this.timerPeriod = (this.timerPeriod & 0x0FF) | (value & 0x7) << 8;
  if (this.enabled) {
    this.lengthCounter = LENGTH_COUNTER_VALUES[(value & 0xF8) >>> 3];
  }
  this.dutyPosition = 0;
  this.envelopeReset = true;
  return value;
};

PulseChannel.prototype.tick = function() {
  if (--this.timerCycle <= 0) {
    this.timerCycle = (this.timerPeriod + 1) << 1;
    return this.dutyPosition = (this.dutyPosition + 1) & 0x7;
  }
};

PulseChannel.prototype.tickQuarterFrame = function() {
  return this.updateEnvelope();
};

PulseChannel.prototype.tickHalfFrame = function() {
  this.updateLengthCounter();
  return this.updateSweep();
};

PulseChannel.prototype.updateEnvelope = function() {
  if (this.envelopeReset) {
    this.envelopeReset = false;
    this.envelopeCycle = this.envelopePeriod;
    return this.envelopeVolume = 0xF;
  } else if (this.envelopeCycle > 0) {
    return this.envelopeCycle--;
  } else {
    this.envelopeCycle = this.envelopePeriod;
    if (this.envelopeVolume > 0) {
      return this.envelopeVolume--;
    } else if (this.envelopeLoop) {
      return this.envelopeVolume = 0xF;
    }
  }
};

PulseChannel.prototype.updateLengthCounter = function() {
  if (this.lengthCounter > 0 && !this.lengthCounterHalt) {
    return this.lengthCounter--;
  }
};

PulseChannel.prototype.updateSweep = function() {
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
    return this.sweepCycle = this.sweepPeriod;
  }
};

PulseChannel.prototype.getSweep = function() {
  var sweep;
  sweep = this.timerPeriod >>> this.sweepShift;
  if (this.sweepNegate) {
    if (this.channelId === 1) {
      return ~sweep;
    } else {
      return -sweep;
    }
  } else {
    return sweep;
  }
};

PulseChannel.prototype.isTimerPeriodValid = function() {
  return this.timerPeriod >= 0x8 && this.timerPeriod + this.getSweep() < 0x800;
};

PulseChannel.prototype.getOutputValue = function() {
  var volume;
  if (this.lengthCounter && this.isTimerPeriodValid()) {
    volume = this.useConstantVolume ? this.constantVolume : this.envelopeVolume;
    return volume * DUTY_WAVEFORMS[this.dutySelection][this.dutyPosition];
  } else {
    return 0;
  }
};

module.exports = PulseChannel;
