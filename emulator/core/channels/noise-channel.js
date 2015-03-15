var LENGTH_COUNTER_VALUES, TIMER_PERIODS_NTSC, TIMER_PERIODS_PAL, logger;

logger = require("../utils/logger").get();

LENGTH_COUNTER_VALUES = require("../common/constants").APU_LENGTH_COUNTER_VALUES;

TIMER_PERIODS_NTSC = [4, 8, 16, 32, 64, 96, 128, 160, 202, 254, 380, 508, 762, 1016, 2034, 4068];

TIMER_PERIODS_PAL = [4, 8, 14, 30, 60, 88, 118, 148, 188, 236, 354, 472, 708, 944, 1890, 3778];

function NoiseChannel() {}

NoiseChannel.prototype.powerUp = function() {
  logger.info("Reseting noise channel");
  this.setEnabled(false);
  this.timerCycle = 0;
  this.envelopeCycle = 0;
  this.envelopeVolume = 0;
  this.shiftRegister = 1;
  this.writeEnvelope(0);
  this.writeTimer(0);
  return this.writeLengthCounter(0);
};

NoiseChannel.prototype.setEnabled = function(enabled) {
  this.enabled = enabled;
  if (!enabled) {
    return this.lengthCounter = 0;
  }
};

NoiseChannel.prototype.setNTSCMode = function(ntscMode) {
  return this.timerPeriods = ntscMode ? TIMER_PERIODS_NTSC : TIMER_PERIODS_PAL;
};

NoiseChannel.prototype.writeEnvelope = function(value) {
  this.lengthCounterHalt = (value & 0x20) !== 0;
  this.useConstantVolume = (value & 0x10) !== 0;
  this.constantVolume = value & 0x0F;
  this.envelopeLoop = this.lengthCounterHalt;
  this.envelopePeriod = this.constantVolume;
  return value;
};

NoiseChannel.prototype.writeTimer = function(value) {
  this.timerMode = (value & 0x80) !== 0;
  this.timerPeriod = this.timerPeriods[value & 0x0F];
  return value;
};

NoiseChannel.prototype.writeLengthCounter = function(value) {
  if (this.enabled) {
    this.lengthCounter = LENGTH_COUNTER_VALUES[(value & 0xF8) >>> 3];
  }
  this.envelopeReset = true;
  return value;
};

NoiseChannel.prototype.tick = function() {
  if (--this.timerCycle <= 0) {
    this.timerCycle = this.timerPeriod;
    return this.updateShiftRegister();
  }
};

NoiseChannel.prototype.tickQuarterFrame = function() {
  return this.updateEnvelope();
};

NoiseChannel.prototype.tickHalfFrame = function() {
  return this.updateLengthCounter();
};

NoiseChannel.prototype.updateShiftRegister = function() {
  var feedbackPosition, feedbackValue;
  feedbackPosition = this.timerMode ? 6 : 1;
  feedbackValue = (this.shiftRegister & 1) ^ ((this.shiftRegister >>> feedbackPosition) & 1);
  return this.shiftRegister = (this.shiftRegister >>> 1) | (feedbackValue << 14);
};

NoiseChannel.prototype.updateEnvelope = function() {
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

NoiseChannel.prototype.updateLengthCounter = function() {
  if (this.lengthCounter > 0 && !this.lengthCounterHalt) {
    return this.lengthCounter--;
  }
};

NoiseChannel.prototype.getOutputValue = function() {
  if (this.lengthCounter && !(this.shiftRegister & 1)) {
    if (this.useConstantVolume) {
      return this.constantVolume;
    } else {
      return this.envelopeVolume;
    }
  } else {
    return 0;
  }
};

module.exports = NoiseChannel;
