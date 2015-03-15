var DUTY_WAVEFORM, LENGTH_COUNTER_VALUES, logger;

logger = require("../utils/logger").get();

LENGTH_COUNTER_VALUES = require("../common/constants").APU_LENGTH_COUNTER_VALUES;

DUTY_WAVEFORM = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

function TriangleChannel() {}

TriangleChannel.prototype.powerUp = function() {
  logger.info("Reseting triangle channel");
  this.setEnabled(false);
  this.timerCycle = 0;
  this.timerPeriod = 0;
  this.dutyPosition = 0;
  this.linearCounter = 0;
  this.writeLinearCounter(0);
  this.writeTimer(0);
  return this.writeLengthCounter(0);
};

TriangleChannel.prototype.setEnabled = function(enabled) {
  this.enabled = enabled;
  if (!enabled) {
    return this.lengthCounter = 0;
  }
};

TriangleChannel.prototype.writeLinearCounter = function(value) {
  this.lengthCounterHalt = (value & 0x80) !== 0;
  this.linearCounterMax = value & 0x7F;
  this.linearCounterControl = this.lengthCounterHalt;
  return value;
};

TriangleChannel.prototype.writeTimer = function(value) {
  this.timerPeriod = (this.timerPeriod & 0x700) | (value & 0xFF);
  return value;
};

TriangleChannel.prototype.writeLengthCounter = function(value) {
  this.timerPeriod = (this.timerPeriod & 0x0FF) | (value & 0x7) << 8;
  if (this.enabled) {
    this.lengthCounter = LENGTH_COUNTER_VALUES[(value & 0xF8) >>> 3];
  }
  this.linearCounterReset = true;
  return value;
};

TriangleChannel.prototype.tick = function() {
  if (--this.timerCycle <= 0) {
    this.timerCycle = this.timerPeriod + 1;
    if (this.lengthCounter && this.linearCounter && this.timerPeriod > 3) {
      return this.dutyPosition = (this.dutyPosition + 1) & 0x1F;
    }
  }
};

TriangleChannel.prototype.tickQuarterFrame = function() {
  return this.updateLinearCounter();
};

TriangleChannel.prototype.tickHalfFrame = function() {
  return this.updateLengthCounter();
};

TriangleChannel.prototype.updateLinearCounter = function() {
  if (this.linearCounterReset) {
    this.linearCounter = this.linearCounterMax;
  } else if (this.linearCounter > 0) {
    this.linearCounter--;
  }
  if (!this.linearCounterControl) {
    return this.linearCounterReset = false;
  }
};

TriangleChannel.prototype.updateLengthCounter = function() {
  if (this.lengthCounter > 0 && !this.lengthCounterHalt) {
    return this.lengthCounter--;
  }
};

TriangleChannel.prototype.getOutputValue = function() {
  return DUTY_WAVEFORM[this.dutyPosition];
};

module.exports = TriangleChannel;
